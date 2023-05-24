
AJS.toInit(function ($) {
    AJS.$("#share-item").click(function(e) {
        e.preventDefault();
        AJS.dialog2("#my-dialog").show();
      });

    AJS.dialog2("#my-dialog").on("show", function() {
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
    });
});