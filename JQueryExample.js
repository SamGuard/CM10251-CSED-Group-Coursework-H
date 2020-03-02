
$(document).ready()
{
  function RequestData() {
      $.get("/data?user=me&id=0", function (data, status) {
          console.log(data);
      });
  }
};