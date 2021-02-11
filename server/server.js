const sql = require("mssql");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const { connConfig } = require("./serverTools/connectionConfig");
const FBAuth = require("./serverTools/fbAuth");

const multer = require("multer");
const uploadFile = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `${__dirname}/uploadedFiles`);
    },
    filename(req, file, cb) {
      cb(null, `${req.body.title}${path.parse(file.originalname).ext}`);
    },
  }),
  limits: {
    fileSize: 10000000, // max file size 1MB = 1000000 bytes
  },
  fileFilter(req, file, cb) {
    if (file.originalname.match(/\.(exe)$/)) {
      return cb(new Error("exe files are not allowed"));
    }
    cb(undefined, true); // continue with upload
  },
});

const app = require("express")();
const port = 7000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/api/dbconnect", FBAuth, (req, res) => {
  sql.connect(connConfig, () => {
    let request = new sql.Request();

    if (req.body.data) {
      for (const [key, value] of Object.entries(req.body.data)) {
        request.input(key, value);
      }
    }
    request.execute(req.body.procedure, (err, result) => {
      try {
        if (err !== null) {
          return res
            .status(400)
            .json({ error: err, errText: err.originalError.info.message });
        }
        return res.status(200).json(result.recordset);
      } catch (error) {
        res.status(500).json({ error, errText: "Internal server error" });
      }
    });
  });
});

app.post(
  "/api/uploadFile",
  FBAuth,
  uploadFile.single("file"),
  async (req, res) => {
    res.status(200).send("File uploaded successfully");
  },
  (error, req, res, next) => {
    if (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

app.get("/api/downloadFile", (req, res) => {
  const fileName = req.query.fileName;
  if (!fileName) return res.status(400).json({ error: "Specify fileName" });

  const fileExt = path.parse(fileName).ext;
  res.download(
    `${__dirname}/uploadedFiles/${fileName}`,
    `AttachedFile${fileExt}`,
    (err) => {
      if (err) {
        if (err.code == "ENOENT") {
          res.status(404).json({ error: `File not found`, fileName });
        } else {
          res.status(400).json({ error: `Unknown error` });
        }
      }
    }
  );

  return;
});

app.post("/api/addInvNumTable", FBAuth, (req, res) => {
  sql.connect(connConfig, () => {
    const table = new sql.Table();

    table.columns.add("id", sql.TYPES.Int);
    table.columns.add("inventory_num", sql.TYPES.VarChar(255));
    table.columns.add("document_id", sql.TYPES.VarChar(255));
    table.columns.add("product_id", sql.TYPES.BigInt);
    table.columns.add("is_out", sql.TYPES.Int);
    table.columns.add("session_info_id", sql.TYPES.Int);
    table.columns.add("storage_id", sql.TYPES.Int);

    req.body.table.forEach((row) => {
      table.rows.add(...row);
    });

    // console.log(table);
    const request = new sql.Request();
    request.input("inventories", table);
    request.input("session_id", req.body.sessionId || null);
    request.execute(
      "[SalaryDB].anbar.[batch_inventory_numbers_insert]",
      (err, result) => {
        try {
          if (err !== null) {
            console.log(err.message);
            return res.status(400).json({ error: err, errText: err.message });
          }
          return res.status(200).json(result.recordset);
        } catch (error) {
          res.status(500).json({ error, errText: "Internal server error" });
        }
      }
    );
  });
});
