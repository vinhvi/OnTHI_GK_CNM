const express = require("express");
const multer = require("multer");
const app = express();
const upload = multer();
const port = 4000;

app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require("aws-sdk");
const { response } = require("express");
const config = new AWS.Config({
  accessKeyId: "AKIA33RYQ4ZFSQY372EB",
  secretAccessKey: "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",
  region: "ap-southeast-1",
});

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "BaiBao";

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.render("index", { data: data.Items });
    }
  });
});
app.get("/add", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.render("add");
    }
  });
});
app.post("/add", upload.fields([]), (req, res) => {
  console.log("req.body =", req.body);
  const { id_bao, name_bao, name_tg, isbn, so_trang, nxb } = req.body;
  const params = {
    TableName: tableName,
    Item: {
      id_bao: id_bao,
      name_bao:name_bao,
      name_tg:name_tg,
      isbn: isbn,
      so_trang: so_trang,
      nxb: nxb,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      return res.send("error " + err);
    } else {
      return res.redirect("/");
    }
  });
});

app.post("/delete", upload.fields([]), (req, res) => {
  const listItems = Object.keys(req.body);

  if (listItems.length === 0) {
    return res.redirect("/");
  }

  function onDeleteItem(index) {
    const params = {
      TableName: tableName,
      Key: {
        id_bao: listItems[index],
      },
    };

    docClient.delete(params, (err, data) => {
      if (err) {
        return res.send("error" + err);
      } else {
        if (index > 0) {
          onDeleteItem(index - 1);
        } else {
          return res.redirect("/");
        }
      }
    });
  }

  onDeleteItem(listItems.length - 1);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
