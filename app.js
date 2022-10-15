//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require ("lodash")
const { performance } = require('perf_hooks');
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var startTime = performance.now()
mongoose.connect("mongodb+srv://ort01:447900226@cluster0.ht1ijse.mongodb.net/todolistDB")


const itemsSchema = new mongoose.Schema ({
  name: String
})


const Item = mongoose.model ("Item", itemsSchema)


const item1 = new Item ({
  name: "Study"
})
const item2 = new Item ({
  name: "Programming"
})
const item3 = new Item ({
  name: "Watch a movie"
})
const defaultItems = [item1,item2,item3]


const listSchema = new mongoose.Schema ({
  name: String,
  items: [itemsSchema]
})
const List = mongoose.model("List", listSchema)




// app.get("/", function(req, res) {
//   Item.find({}, function (err, foundItems){
//     if (foundItems.length === 0){
//       Item.insertMany (arrayOfObjects, function (err){
//           if (err){
//             console.log(err);
//           } else {
//             console.log("inserted");
//           }
//         })
//       res.redirect("/");
//     } else {
//       res.render("list", {listTitle: "Today", newListItems: foundItems});
//     }
//   });
// });

app.get("/", function(req, res) {
    Item.find({}, function (err, foundItems){
      if (!err){
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      } 
    });
  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list; 

  const itemPlus = new Item ({
    name: itemName
  })

  if (listName === "Today"){
    itemPlus.save(function (err){
      res.redirect("/")
    })
    
  } else {
    List.findOne ({name: listName}, function (err, foundList){
      foundList.items.push(itemPlus)
      foundList.save()
      res.redirect ("/" + listName)
    })
  }

});

app.post ("/delete", function(req,res){
  
  const checkedItemId = req.body.checkBoxDelete;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove (checkedItemId, function (err){
      if (!err){
        console.log("Succesfully deleted");
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate ({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList){
      if (!err){
        res.redirect("/" + listName)
      }
    });
  }
});

app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName)
 
  List.findOne({name: listName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List ({
          name: listName,
          items: []
        })

        list.save(function (err, result){
          res.redirect("/" + listName)
        })
      } else {
        res.render ("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
