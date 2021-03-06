const router = require('express').Router();
const connectionRequest =  require('../config/database_config');
// var dateTime = require('node-datetime');

//// seller Product reg validation
const {sellerProductRegisterValidation} = require('../Validations/validation');


// Register Route
router.post('/register', async (req, res) => {
    try {
         // ----------------  Validate data -------------------
        const {error} = sellerProductRegisterValidation(req.body);
        if (error) return res.status(400).json({Success: 0, Error: error.details[0].message});

        connectDB = connectionRequest();
        // ----------------- Check if Product already register -----------------
        let find_query = `SELECT * FROM Products WHERE name = '${req.body.name}' AND seller_id =  '${req.body.seller_id}';`;

        connectDB.query(find_query, async (err, result) => {
            if(err){
                return res.status(400).json({Success: 0, Error: err.message});
            } 
            else if(result.length != 0){
                return res.status(400).json({Success: 0, Error: "Product Already Exists"});
            }
            else{

                let status = "ok";
                let reason = "";
                let description = req.body.description || "";
                // For today date.
                var today_date = new Date();

                 // // ----------------- Register Product ------------------
                let reg_query = `INSERT INTO Products (name, type, price, quantity, description, seller_id, status, reason, publish_date, image_path) 
                                VALUES ( '${req.body.name}', '${req.body.type}', '${req.body.price}', '${req.body.quantity}', '${description}', 
                                         '${req.body.seller_id}', '${status}', '${reason}', '${today_date}', '${req.body.image_path}' ); `;

                connectDB.query(reg_query, (err, result) => {
                    if (err)
                    {
                        return res.status(400).json({
                            Success: 0,
                            Error: err.message
                        });
                    }else
                    {
                        return res.status(200).json({
                            Success: 1,
                            message: "Product created successfully",
                            product_id: result.insertId
                        });
                    }
                });
            }
        });
    } catch (err) {

        res.status(400).json({
            Success: 0,
            Error: err.message,
        });
    }
});


router.get('/', (req, res) => {
    try{
        connectDB = connectionRequest();
        let find_query = `SELECT * FROM Products`;

        connectDB.query(find_query, (err, result) => {
            if (err) return res.status(400).json({Success: 0,Error: err.message});
    
            else if(result.length > 0){
                return res.status(200).json({Success:1, data: result});
            } 
    
            else{ res.status(400).json({Success: 0,Error: "no product found"});}
        } );
    }
    catch(err)
    {
        res.status(500).json({
            Success: 0,
            Error: err.message
        });
    }
});


module.exports = router;