import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart, cartItems, allProducts }) => {
  //console.log(product)
  
  return (
    <Card className="card">
      {/* <CardMedia
        sx={{ height: 220 }}
        image={product.image}
      /> */}
      <img src ={product.image} alt = {product.name} />
      <CardContent>
        <Typography gutterBottom >{product.name}</Typography>
        <Typography gutterBottom  style = {{fontWeight : "600"}}>${product.cost}</Typography>
        <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
      <CardActions>
        <Button  className = "card-button" variant = "contained" sx={{width : "100%"}} onClick = {() => handleAddToCart(localStorage.getItem("token"),cartItems,allProducts,product._id,1,true)}>
          <AddShoppingCartOutlined sx={{ paddingRight : "10px" }} />ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
