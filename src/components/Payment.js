import React,{useState, useEffect} from 'react';
import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import { Box } from "@mui/system";
import "./Thanks.css";
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import Footer from "./Footer";
import Header from "./Header";
const Payment = () => {
    const [amount, setamount] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const history = useHistory();
  const handleSubmit = (e)=>{
    e.preventDefault();
    
      var options = {
        key: "rzp_test_Af1Mm956dMiSRA",
        key_secret:"mGnsp5pNdIbxey9a41WF6X8Z",
        amount: amount *100,
        currency:"INR",
        name:"QKart",
        description:"Online payment",
        handler: function(response){
            enqueueSnackbar(
                "Payment Successful",
                { variant: "Success" }
              );
            history.push("/Thanks");
        },
        prefill: {
          name: localStorage.getItem("username"),
          email:localStorage.getItem("username") + "@gmail.com",
          contact:"7904425033"
        },
        notes:{
          address:"Razorpay Corporate office"
        },
        theme: {
          color:"#00845c"
        }
      };
      var pay = new window.Razorpay(options);
      pay.open();
    }
  
  useEffect(() => {
    (async () => {
      let totalPrice = 5000 - localStorage.getItem("balance"); 
      setamount(totalPrice);
      console.log(amount);
    })();
  }, []);
  return (
    <div>
        <Header />
        <Box className="greeting-container">
     <h1>Amount to be paid</h1>
     <h2>₹{5000 - localStorage.getItem("balance")}</h2>
     <br/><br/>
     <Button
              onClick={handleSubmit}
               variant="contained"
            >
              Pay
            </Button>
            </Box>
            <Footer />
    </div>
  );
}


export default Payment;