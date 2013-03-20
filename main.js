// Models
window.Book = Backbone.Model.extend({
    urlRoot:"/books",
    defaults:{
        "id":null,
        "name":"",
        "author":"",
        "status":"Choose Book Status",
        }
});

window.BookCollection = Backbone.Collection.extend({
    model:Book,
    url:"/Books"
});


// Views
window.BookListView = Backbone.View.extend({

    tagName:'ul',

    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (book) {
            $(self.el).append(new BookListItemView({model:book}).render().el);
        });
    },

    render:function (eventName) {
        _.each(this.model.models, function (book) {
            $(this.el).append(new BookListItemView({model:book}).render().el);
        }, this);
        return this;
    }
});

window.BookListItemView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#tpl-book-list-item').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    }
});

window.BookView = Backbone.View.extend({

    template:_.template($('#tpl-book-details').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events:{
        "change input":"change",
        "click .save":"saveBook",
        "click .delete":"deleteBook"
    },

    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
    },

    saveBook:function () {
        this.model.set({
            name:$('#name').val(),
            author:$('#author').val(),
            status:$('#status').val(),
        });
        if (this.model.isNew()) {
            app.bookList.create(this.model);
        } else {
            this.model.save();
        }
        return false;
    },

    deleteBook:function () {
        this.model.destroy({
            success:function () {
                alert('Book deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).empty();
    }
});

window.HeaderView = Backbone.View.extend({

    template:_.template($('#tpl-header').html()),

    initialize:function () {
        this.render();
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events:{
        "click .new":"newBook"
    },

    newBook:function (event) {
        if (app.bookView) app.bookView.close();
        app.bookView = new BookView({model:new Book()});
        $('#content').html(app.bookView.render().el);
        return false;
    }
});


// Router
var AppRouter = Backbone.Router.extend({

    routes:{
        "":"list",
        "books/:id":"bookDetails"
    },

    initialize:function () {
        $('#header').html(new HeaderView().render().el);
    },

    list:function () {
        this.bookList = new BookCollection();
        this.bookListView = new BookListView({model:this.bookList});
        this.bookList.fetch();
        $('#sidebar').html(this.bookListView.render().el);
    },

    bookDetails:function (id) {
        this.book = this.bookList.get(id);
        if (app.bookView) app.bookView.close();
        this.bookView = new BookView({model:this.book});
        $('#content').html(this.bookView.render().el);
    }

});

var app = new AppRouter();
Backbone.history.start();