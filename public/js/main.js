$(document).ready(function(){
  $('.delete-student').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/students/'+id,
      success: function(response){
        alert('Deleting student..');
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
