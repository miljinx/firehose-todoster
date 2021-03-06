$(function() {
  // Creates an <li> element out of JSON data for Tasks
  function taskHtml(task) {
    var checkedStatus = task.done ? "checked" : "";
    var liClass = task.done ? "completed" : "";
    var liElement = '<li id="listItem-' + task.id + '" class="' + liClass +'">' +
      '<div class="view"><input class="toggle" type="checkbox"' +
      " data-id='" + task.id + "'" +
      checkedStatus +
      '><label>' +
      task.title +
      '</label></div></li>';

    return liElement;
  }

  // takes in HTML of Task fired by .change()
  // and updates DB with value of 'done' field with AJAX
  function toggleTask(e) {
    var itemId = $(e.target).data("id");
    var doneValue = Boolean($(e.target).is(':checked'));

    $.post("/tasks/" + itemId, {
      _method: "PUT",
      task: {
        done: doneValue
      }
    }).success(function(data){
      var liHtml = taskHtml(data);
      var $li = $('#listItem-' + data.id);
      $li.replaceWith(liHtml);
      $('.toggle').change(toggleTask);
      showClearCompleted();
    });
  }

  // find completed list items and push their ids and their task ids to an array
  function getCompletedLis() {
    var completedLis = [];
    $('.todo-list li').each(function(i){
      if ( this.getAttribute('class').match(/completed/) ) {
        completedLis.push(
          {
            liId: this.getAttribute('id'),
            taskId: Number(this.firstChild.firstChild.getAttribute('data-id'))
          }
        );
      }
    });
    return completedLis;
  }

  // hides clear-completed button if there are completed tasks, and vice versa
  function showClearCompleted() {
    if (getCompletedLis().length === 0) {
      $('.clear-completed').hide();
    } else {
      $('.clear-completed').show();
    }
  }

  $.get("/tasks").success(function(data) {
    var htmlString = "";
    data.forEach(function(task, i) {
      htmlString += taskHtml(task);
    });
    var ulTodos = $('.todo-list');
    ulTodos.html(htmlString);

    $('.toggle').change(toggleTask);
    showClearCompleted();
  });

  $('#new-form').submit(function(event) {
    event.preventDefault();
    var textbox = $('.new-todo');
    var payload = {
      task: {
        title: textbox.val()
      }
    }
    $.post("/tasks", payload).success(function(data){
      var htmlString = taskHtml(data);
      var ulTodos = $('.todo-list');
      ulTodos.append(htmlString);
      $('.toggle').change(toggleTask);
      $('.new-todo').val('');
      showClearCompleted();
    });
  });

  $('.clear-completed').click(function() {
    var completedLis = getCompletedLis();
    completedLis.forEach(function(el, i) {
      $.ajax({
        type: "DELETE",
        url: "/tasks/" + el.taskId
      });
      $('#' + el.liId).remove();
    });
    showClearCompleted();
  });

});
