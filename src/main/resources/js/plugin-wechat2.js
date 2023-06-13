let templatePrGroupRow = '<tr>' +
                             '<td><input type="checkbox" class="checkbox-selected-prgroup" name="${name}" title="${checkbox_title}" ${disabled_flag}></td>' +
                             '<td></td>' +
                             '<td>${start_link}${name}${end_link}</td>' +
                             '<td></td>' +
                         '</tr>'
let templatePrGroupRow2 = '<tr id=row${group}>' +
                         '<td><input type="checkbox" class="checkbox-selected-prgroup2" name="${group}" title="${checkbox_title}" ${disabled_flag}></td>' +
                         '<td></td>' +
                         '<td>${start_link}${name}${end_link}</td>' +
                         '<td>${start_link2}删除组${end_link2}</td>' +
                     '</tr>'
let templateMemberRow = '<tr>' +
                            '<td><img class="member-avatar" src="${user_avatar_url}" alt="pr_group_icon"/></td>' +
                            '<td>${displayName}</td>' +
                        '</tr>'
let hasGroupsLoaded = false;

let selections = [];
let groups = [];
let maxSelection = 0;
let currentSelection = -1;
let newSelection = false;

AJS.toInit(function ($) {
    console.log("11111112");
    
    AJS.$("#share-item").click(function(e) {
        e.preventDefault();
        console.log("2222222222");
        AJS.dialog2("#select-group-dialog").show();
        AJS.$.ajax({
            url: "/rest/api/group",
            dataType: "json",
            success: function(data) {
                console.log(data);
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
            $(".no-groups-message").toggle((data.length === 0));
            $("#prgroups-table-container").toggle((data.length !== 0));
            groups = [];
            // Add a table on the dialog, with each group. If a group has its members truncated, it cannot be selected. Disable checkbox & put a tooltip
            data.forEach(function(group) {
                groups.push(group);
                group["start_link"] = '<a class="show-member-link" data-name="'+ group["name"] + '" href="#">'
                group["end_link"] = '</a>'
                $('#prgroups-table-container').find('tbody:last').append(strTemplate(templatePrGroupRow, group));
            });
            togglePrGroupSection(true)
        }

        function addHandlers() {
            $("#add-group-button").on("click", function(e) {
                e.preventDefault();
                AJS.dialog2($("#select-group-dialog")).show();
                loadDialog();
            });
    
            $("#cancel-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                AJS.dialog2($("#select-group-dialog")).hide();
            });
    
            $("#select-member-dialog-button").on("click", function(e) {
                e.preventDefault();
                newSelection = true;
                showMemberSelectDialog(maxSelection);
            });

            $("#confirm-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                shareToWeChat();
            });
    
            $("#select-all-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                $('.checkbox-selected-prgroup:not([disabled])').prop('checked', true);
                $('.checkbox-selected-prgroup2:not([disabled])').prop('checked', true);
            });
    
            $("#clear-all-prgroup-dialog-button").on("click", function(e) {
                e.preventDefault();
                $('.checkbox-selected-prgroup').prop('checked', false);
                $('.checkbox-selected-prgroup2').prop('checked', false);
            });
    
            $("#prgroups-table").on("click", ".show-member-link", function() {
                showMemberInfoDialog($(this).attr("data-name"));
            });

            $("#prgroups-table").on("click", ".show-member-link2", function() {
                showMemberInfoDialog2($(this).attr("data-name"));
            });

            $("#prgroups-table").on("click", ".delete-group", function() {
                deleteGroup($(this).attr("data-name"));
            });
    
            $("#member-info-close-dialog-button").on("click", function(e) {
                e.preventDefault();
                AJS.dialog2($("#member-info-dialog")).hide();
            });
            $('.aui-dialog2-header-close1').on('click', function() {
                e.preventDefault();
                AJS.dialog2($("#select-group-dialog")).hide();
            });
            $('.aui-dialog2-header-close2').on('click', function() {
                e.preventDefault();
                AJS.dialog2($("#member-info-dialog")).hide();
            });
            $('.aui-dialog2-header-close3').on('click', function() {
                e.preventDefault();
                var select2Selector = AJS.$("#select2Selector");
                select2Selector.empty();
                var inputSelector = AJS.$("#inputSelector");
                inputSelector.val('');
                AJS.dialog2($("#member-select-dialog")).hide();
            });
            $("#member-select-close-dialog-button").on("click", function(e) {
                e.preventDefault();
                var select2Selector = AJS.$("#select2Selector");
                select2Selector.empty();
                var inputSelector = AJS.$("#inputSelector");
                inputSelector.val('');
                AJS.dialog2($("#member-select-dialog")).hide();
            });
            $("#confirm-select-dialog-button").on("click", function(e) {
                e.preventDefault();
                var select2Selector = AJS.$("#select2Selector");
                
                if (newSelection) {//说明是新建的
                    currentSelection = maxSelection;
                    maxSelection = maxSelection + 1;
                    var groupName = "临时组" + currentSelection
                    var group = [];
                    group["name"] = groupName;
                    group["group"] = currentSelection;
                    console.log("name="+groupName);
                    group["start_link"] = '<a class="show-member-link2" data-name="'+ currentSelection + '" href="#">'
                    group["end_link"] = '</a>'
                    group["start_link2"] = '<a class="delete-group" data-name="'+ currentSelection + '" href="#">'
                    group["end_link2"] = '</a>'
                    $('#prgroups-table-container').find('tbody:last').prepend(strTemplate(templatePrGroupRow2, group));
                }
                var value = select2Selector.select2('data');
                selections[currentSelection] = value;
                select2Selector.empty();
                var inputSelector = AJS.$("#inputSelector");
                inputSelector.val('');
                AJS.dialog2($("#member-select-dialog")).hide();
            });
        }

        function showMemberSelectDialog(group) {
            AJS.dialog2($("#member-select-dialog")).show();
            $("#member-select-heading-text").text("临时组: " + group)
            var inputSelector = AJS.$("#inputSelector");
            var addSelector = AJS.$("#addSelector");
            var clearSelector = AJS.$("#clearSelector");
            var select2Selector = AJS.$("#select2Selector");

            $("#inputSelector").attr("placeholder", "请输入用户名");
            // 用户输入时调用REST API查找用户
            inputSelector.select2({
                theme: "aui",
                placeholder: "请输入用户名",
                allowClear: true,
                minimumInputLength: 2,
                ajax: {
                url: function(params) {
                    console.log(params);
                    return "/rest/api/search?cql=user.fullname~" + params;
                },
                dataType: "json",
                results: function(data) {
                    console.log(data);
                    var results = [];
                    AJS.$.each(data.results, function(index, value) {
                    results.push({
                        id: value.user.username,
                        text: value.user.displayName
                    });
                    });
                    return {
                    results: results
                    };
                }
                }
            });

            // 添加按钮的点击事件处理程序
            addSelector.click(function() {
                var value = inputSelector.select2('data');
                var option = new Option(value.text, value.id, true, true);
                select2Selector.append(option).trigger("change");
                inputSelector.val("");
            });

            // 回车键的键盘事件处理程序
            inputSelector.keypress(function(e) {
                if (e.which == 13) {
                    var value = inputSelector.select2('data');;
                    var option = new Option(value.text, value.id, true, true);
                    select2Selector.append(option).trigger("change");
                    inputSelector.val("");
                }
            });

            // 清除选择框中的所有值
            clearSelector.click(function() {
                select2Selector.empty();
                if (newSelection !== true)
                {
                    selections[currentSelection] = [];
                }
                select2Selector.val([]).trigger("change");
            });

            // 初始化AUI-Select2控件
            select2Selector.select2({
                theme: "aui"
            });
        }

        function showMemberInfoDialog(groupName) {
            AJS.dialog2($("#member-info-dialog")).show();
            $("#member-info-table").empty().append('<tr style="display: none;"></tr>');    
            $("#member-info-heading-text").text("Group Members: " + groupName)
            
            let MEMBER_REST_ENDPOINT = "/rest/api/group/{groupName}/member";
            AJS.$.ajax({
                url: MEMBER_REST_ENDPOINT.replace('{groupName}', groupName),
                dataType: "json",
                success: function(data) {
                    console.log(data);
                    $(".no-members-info-message").toggle((data["results"].length === 0));
                    $("#member-info-table-container").toggle((data["results"].length !== 0));
                    data["results"].forEach(function (member) {
                        member["user_avatar_url"] = member["profilePicture"]["path"];
                        $('#member-info-table-container').find('tbody:last').append(strTemplate(templateMemberRow, member));
                    });

                },
                error: function(xhr, statusText, errorThrown) {
                    console.log(statusText);
                }
            });
            
        }
        
        function showMemberInfoDialog2(groupName) {
            newSelection = false;
            var group = Number(groupName);
            console.log("showMemberInfoDialog2:"+group)
            currentSelection = group;
            showMemberSelectDialog(group);
            var select2Selector = AJS.$("#select2Selector");
            console.log(selections[group]);
            selections[group].forEach(function(member){
                var option = new Option(member.text, member.id, true, true);
                select2Selector.append(option).trigger("change");
            });
        }

        function deleteGroup(groupName) {
            var group = Number(groupName);
            var rowId = "row" + group;
            var rowToDelete = document.querySelector('#' + rowId); // 获取要删除的行节点
            rowToDelete.parentNode.removeChild(rowToDelete); // 删除行节点
        }

        function shareToWeChat() {
            let selectedReviewers = {};
            var ajaxRequests = [];

            $('.checkbox-selected-prgroup:checked').each(function () { // For each selected group
                let selectedGroupName = $(this).attr("name");
                let MEMBER_REST_ENDPOINT = "/rest/api/group/{groupName}/member";
                var ajaxPromise = new Promise(function(resolve, reject) {
                    AJS.$.ajax({
                        url: MEMBER_REST_ENDPOINT.replace('{groupName}', selectedGroupName),
                        dataType: "json",
                        success: function(data) {
                            data["results"].forEach(function (member) {
                                selectedReviewers[""+member.username] = ""+member.username;
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
            });

            $('.checkbox-selected-prgroup2:checked').each(function () { // For each selected group
                let selectedGroupName = $(this).attr("name");
                var group = Number(selectedGroupName);
                selections[group].forEach(function (member) {
                    selectedReviewers[""+member.id] = ""+member.text;
                });
            });

            //使用 Promise.all() 来等待所有的异步请求完毕
            return Promise.all(ajaxRequests).then(function() {
                console.log("333333333333");
                var pageId = AJS.Meta.get('page-id');
                var reviewersString = '';
                
                for(var index in selectedReviewers) {
                    reviewersString = reviewersString + index + '|';
                }

                AJS.dialog2($("#select-group-dialog")).hide();
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
            hasGroupsLoaded = false;
            $("#prgroups-table tbody").empty().append('<tr style="display: none;"></tr>');
            togglePrGroupSection(false)
        }

        function togglePrGroupSection(visible) {
            $("#prgroups-section").toggle(visible);
            $("#loadspinner").toggle(!visible);
        }
      });

});