let templatePrGroupRow = '<tr id=${id}>' +
                            '<td></td>' +
                            '<td><img class="prgroup-icon" src="${prgroup_icon_url}" alt="Image"/></td>' +
                             '<td>${name}</td>' +
                             '<td>${start_link}删除${end_link}</td>' +
                         '</tr>'

let hasGroupsLoaded = false;

let selections = {};
let groups = [];
let maxSelection = 0;
let currentSelection = -1;
let param ='';

AJS.toInit(function ($) {
    console.log("11111112");
    
    AJS.$("#share-item").click(function(e) {
        e.preventDefault();
        AJS.dialog2("#select-group-dialog").show();
        AJS.$.ajax({
            url: "/rest/api/group",
            dataType: "json",
            success: function(data) {
                if (hasGroupsLoaded)
                    return;
                populateDialog(data.results);
                addHandlers();
                hasGroupsLoaded = true;
            },
            error: function(xhr, statusText, errorThrown) {
                console.log(statusText);
            }
        });

        function populateDialog(data) {
            $("#prgroups-table-container").toggle((data.length !== 0));
            groups = data;
            var inputSelector = AJS.$("#inputSelector");
            var addSelector = AJS.$("#addSelector");

            $("#inputSelector").attr("placeholder", "请输入用户名或组名");
            // 用户输入时调用REST API查找用户
            inputSelector.select2({
                theme: "aui",
                placeholder: "请输入用户名或组名",
                allowClear: true,
                minimumInputLength: 2,
                ajax: {
                    url: function(params) {
                        console.log(params);
                        param = params;
                        if(!isEnglish(params))
                        {
                            console.log("haschinese " + params);
                            return "/rest/api/search?cql=user.fullname~mao";
                        }
                        else
                        {
                            console.log("hasnotchinese " + params);
                            return "/rest/api/search?cql=user.fullname~" + params;
                        }
                        
                    },
                    dataType: "json",
                    results: function(data) {
                        console.log(data);
                        var results = [];
                        console.log("找到了");
                        const keyword = param;
                        const regExpPattern = `.*${keyword}.*`; // 正则表达式模式
                        const regExpFlags = 'gi'; // 正则表达式标志，g 表示全局匹配，i 表示忽略大小写
                        const regExp = new RegExp(regExpPattern, regExpFlags);
                        groups.forEach(function(group){
                            if(regExp.test(group.name))
                            {
                                results.push({
                                    id: group.name,
                                    text: group.name,
                                    type: 'group',
                                    pic: AJS.contextPath() + "/images/icons/avatar_group_48.png"
                                });
                            }
                        });
                        if(hasChinese(param)==false)
                        {
                            AJS.$.each(data.results, function(index, value) {
                                results.push({
                                    id: value.user.username,
                                    text: value.user.displayName,
                                    type: 'user',
                                    pic: value.user.profilePicture.path
                                });
                            });
                        }
                        
                        return {
                            results: results
                        };
                    }
                }

            });

            // 添加按钮的点击事件处理程序
            addSelector.click(function() {
                var value = inputSelector.select2('data');
                inputSelector.select2('val', '')
                if (value.id in selections) {
                    AJS.flag({
                        type: 'warning',
                        close: 'auto',
                        body: '重复加入',
                    });
                }
                else
                {
                    selections[value.id] = value.type;
                    var group = {};
                    group["id"] = value.id;
                    group["prgroup_icon_url"] = value.pic;   
                    group["start_link"] = '<a class="delete-group" data-name="'+ value.id + '" href="#">';
                    group["end_link"] = '</a>';
                    group["name"] = value.text;
                    $('#prgroups-table-container').find('tbody:last').append(strTemplate(templatePrGroupRow, group));
                }
                
            });

        }

        function addHandlers() {
            $("#cancel-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                AJS.dialog2($("#select-group-dialog")).hide();
            });

            $("#confirm-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                shareToWeChat();
            });
    
            $('.aui-dialog2-header-close').on('click', function() {
                e.preventDefault();
                AJS.dialog2($("#select-group-dialog")).hide();
            }); 

            $("#prgroups-table").on("click", ".delete-group", function() {
                deleteGroup($(this).attr("data-name"));
            });

            $("#clearSelector").on("click", function() {
                var inputSelector = AJS.$("#inputSelector");
                inputSelector.select2('val', '')
                selections = {};
                resetDialog();
            });
        }

        function deleteGroup(groupName) {
            console.log(groupName);
            var rowToDelete = document.querySelector('#' + groupName); // 获取要删除的行节点
            rowToDelete.parentNode.removeChild(rowToDelete); // 删除行节点
            delete selections[groupName];
            console.log(selections);
        }

        function shareToWeChat() {
            let selectedReviewers = {};
            var ajaxRequests = [];

            for(var index in selections) {
                if(selections[index] == 'group')
                {
                    let MEMBER_REST_ENDPOINT = "/rest/api/group/{groupName}/member";
                    var ajaxPromise = new Promise(function(resolve, reject) {
                        AJS.$.ajax({
                            url: MEMBER_REST_ENDPOINT.replace('{groupName}', index),
                            dataType: "json",
                            success: function(data) {
                                data["results"].forEach(function (member) {
                                    selectedReviewers[""+member.username] = 1;
                                });
                                resolve(); //异步请求成功，使用 resolve() 函数调用 then() 方法
                            },
                            error: function(xhr, statusText, errorThrown) {
                                console.log(statusText);
                                reject(errorThrown); //异步请求失败，使用 reject() 函数调用 catch() 方法
                            }
                        });
                    });
                    ajaxRequests.push(ajaxPromise); //将每个 Promise 对象加入数组用来等待Promise.all() 结果
                }
                else
                {
                    selectedReviewers[index] = 1;
                }
            }


            //使用 Promise.all() 来等待所有的异步请求完毕
            return Promise.all(ajaxRequests).then(function() {
                if(Object.keys(selectedReviewers).length === 0 )
                {
                    AJS.flag({
                        type: 'warning',
                        close: 'auto',
                        body: '请选择需要分享的用户',
                    });
                    return false;
                }
                AJS.dialog2($("#select-group-dialog")).hide();
                var pageId = AJS.Meta.get('page-id');
                var reviewersString = '';    
                for(var index in selectedReviewers) {
                    reviewersString = reviewersString + index + '|';
                }

                $.ajax({
                    url: AJS.contextPath() + "/pages/share-action.action?pageId=" + pageId,
                    contentType: "application/x-www-form-urlencoded",
                    type: "POST",
                    dataType: "json",
                    data: {data:reviewersString},
                    success: function(data) {
                        // 处理返回的 JSON 数据                       
                        AJS.flag({
                            type: 'success',
                            close: 'auto',
                            body: '分享成功',
                        });
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        // 请求出错时的处理
                        AJS.flag({
                            type: 'success',
                            close: 'auto',
                            body: '分享成功',
                        });
                    }
                });
                return true;
            }).catch(function(error) {
                console.log(error);
                return error;
            });
        }

        function strTemplate(str, data) {
            var regex = new RegExp('\\${(' + Object.keys(data).join('|') + ')}', 'gi');
            str = str.replace(regex, function(matched) {
                return data[matched.replace("$", "").replace("{", "").replace("}", "")];
            });
            return str;
        }

        function resetDialog() {
            $("#prgroups-table tbody").empty().append('<tr style="display: none;"></tr>');
        }

        function hasChinese(str) {
            return /[\u4e00-\u9fa5%27]/gm.test(str);
        }

        function isEnglish(str) {
            return /^[a-zA-Z]+$/.test(str);
          }
      });

});