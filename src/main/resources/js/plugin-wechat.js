
AJS.toInit(function ($) {
    console.log("11111112");
    cn.mjayeey.confluence.dialogs();
    AJS.$("#share-item").click(function(e) {
        e.preventDefault();
        console.log("2222222222")
        AJS.dialog2("#select-group-dialog").show();
      });
    /*
    AJS.$("#share-item").click(function(e) {
        e.preventDefault();
        console.log("2222222222")
        AJS.dialog2("#my-dialog").show();
      });

    AJS.dialog2("#my-dialog").on("show", function() {
        console.log("3333333")
        AJS.$.ajax({
            url: "/rest/api/latest/users",
            dataType: "json",
            success: function(data) {
            var users = data.users;
            var $select = AJS.$("#my-select");
            AJS.$.each(users, function(index, user) {
                $select.append(AJS.$("<option>").val(user.name).text(user.displayName));
            });
            }
        });
    });*/
});