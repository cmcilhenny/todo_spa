$(function(){
    // var testObj = {msg: "Hello, world!"};
    // var myTest = $(HandlebarsTemplates.test(testObj));
    // console.log(myTest)
    //   $("#testCon").append(myTest);

// setting App as empty hash
    var App = {}; 
    // setting App as global variable.
    window.App = App;

// setting an empty array called todos 
    var todos = [];
    // setting a model on the App. You can do this because the App is an empty hash.
    App.models = todos;

// CM..function to find todo items (also called model). WHy not remove the foundModel item and return item within the loop? 
    App.findModel = function(id){
        var foundModel;
       $(this.models).each( function(index, item){
            if(item.id === id){
                foundModel = item
            }
       });
       return foundModel;
    };

    // We might say App.setTarget("#todos"), 
    //      which is where we will append todos
    App.setTarget = function(sel){
        this.targetSel = sel;
        this.$target = $(sel);
        return this;
    }; 
    // We might say App.setTemplate("todo"), 
    //      which is what we will use to make todos
    App.setTemplate = function(name){
      this.template = HandlebarsTemplates[name];
      return this;  
    };
    
    // Chaining example:
    // App.setTarget("#todos").setTemplate("todo")
    
    // We might say App.setTargetTemplate("#todos", "todo")
    App.setTargetTemplate = function(sel, name){
        this.setTarget(sel).setTemplate(name);
        return this;
    };
    
    App.render = function(item){
       this.$el = $(this.template(item));
       this.$target.append(this.$el);
       return this;
    };

    App.renderAllModels = function(){
        var _this = this;
        $(this.models).each(function(index, todoModel){
            _this.render(todoModel);
        });
        return this;
    };

    App.saveModel = function(model, callback){
        // DO SOME STUFF HERE TO PERSIST DATA
        var title = $("#todo_title").val();

        $.ajax({
            url: '/todos',
            method: "POST",
            data: {
                "todo": {
                    "title": title
                }
            },
        dataType: "json",
        success: function(data) {
            // console.log(data);
            $("#todo_title").val("");
            // putting callback into success function because at this point the model has an id, which can be reflected in the DOM.
            callback(data);
            },
        error: function(data) {
            console.log("Error: ");
            console.log(data);
            }
        });
        // callback(model);
    };

    App.updateItem = function(model, callback){
        // DO SOMETHING HERE. add post here this.urls.index.path
        $.ajax({
            url: this.urls.update.path + model.id,
            method: this.urls.update.method,
            data: {
                "todo": {
                    "completed": model.completed
                }
            },
        dataType: "json",
        success: function(data) {
            console.log(data);
            callback(model);
            },
        error: function(data) {
            console.log("Error: ");
            console.log(data);
            }
        });
    };

    App.deleteItem = function(model, callback){
        $.ajax({
            url: '/todos/' + model.id,
            method: "DELETE",
        success: function(data) {
            console.log(data);
            callback(model);
            },
        error: function(data) {
            console.log("Error: ");
            console.log(data);
            }
        });
    };

    App.doThis = function(func){
    	func.apply(App);
        return this;
    };

    App.urls = {
        index : { path: '/todos.json', method : 'get'},
        create : { path : '/todos.json', method : 'post'},
        update : { path: '/todos/', method : 'post'}
    };

    App.getItems = function(callback) {
        $.ajax({
            url : this.urls.index.path,
            type : this.urls.index.method
        }).done(callback);
    }

    App.setTargetTemplate("#todos", "todo")
    .renderAllModels().doThis(function(){
        var _this = this;
        // Add new models from a form
        $("#addTodo").on("submit",function(event){
            event.preventDefault();
            var newTodo = {completed: false};
            newTodo.title = $("#todo_title").val();
            
            _this.saveModel(newTodo, function(data){
                _this.models.push(data);
                _this.render(data);
            });
        });
        
    });

// why not just pass App as an argument into the function: 
    // function(App) {...}
    App.doThis(function(){
        var _this = this;
        
        //CHECKBOX EVENTHANDLER
        $("#todos").on("click", ".todo", function(event){
           console.log(this.dataset); 
           var id = Number(this.dataset.id);
           if(event.target.name === "completed"){
                console.log("FIRED!!!")
               var view = this;
               var todo = _this.findModel(id);
               // updated todo to _this to fix the bug in homework question #2. but then this worked??
               todo.completed = !todo.completed;
               // console.log(_this)
               _this.updateItem(todo, function(data){
                    $(view).toggleClass("done-true");
               });
           }
            if(event.target.id === "removeTodo") {
                var view = this;
                var todo = _this.findModel(id);
                _this.deleteItem(todo, function(data){
                    console.log(data);
                });
            }
        });
    });

    App.doThis(function() {
        var _this = this;

        _this.getItems(function(responseData) {
            _this.models = _this.models.concat(responseData);
            _this.renderAllModels();
        });
    });

});
