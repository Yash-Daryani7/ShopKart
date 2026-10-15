# ShopKart

ShopKart is a full-stack shopping app for browsing a product catalog and managing the whole purchase journey in one place. Customers can create an account, save products for later, add items to their cart, and review their orders after checkout.

## The shopping experience

### Find something to buy

The product catalog brings items from several categories into one searchable list. Search by name or description, narrow the list by category, and sort by price. Each product has its own detail page with its description, price, category, and stock availability.

### Keep track of favorites and your cart

Signed-in customers can add and remove products from a personal wishlist. The cart keeps quantities in sync as items are added, increased, decreased, or removed, and shows the running subtotal. Stock limits are respected when updating quantities.

### Checkout and orders

Checkout collects the delivery address and contact details, then starts a Razorpay payment. The backend verifies the payment signature before marking an order as paid. After a successful purchase, customers can see the confirmation page, browse their order history, and open an order to review its items, payment status, and delivery information.

### Customer account

Customers can register, log in, and log out. The session is maintained with an HttpOnly cookie, and the account page shows profile details and provides a password-change form.

## A few details

- Product browsing, wishlist, cart, checkout, and order history are connected to the backend rather than being static mock screens.
- Wishlist, cart, and order data are associated with the signed-in customer.
- Product search, category filtering, and price sorting can be combined.
- The interface is responsive, with layouts for both desktop and smaller screens.
- The sample catalog covers electronics, fashion, books, home, and sports.

## Built with

The frontend uses React, Vite, React Router, Tailwind CSS, and Axios. The API is built with Node.js and Express, with MongoDB and Mongoose for persistence. Razorpay handles checkout payments.

## How the app is organized

```text
backend/
  config/       Payment integration
  controllers/  Customer, product, wishlist, cart, and order logic
  middlewares/  Authentication
  models/       MongoDB data models
  routes/       API endpoints
  tests/        Backend tests
  index.js      Express application
  seed.js       Example product catalog

frontend/
  src/
    components/ Shared interface components
    context/    Shared cart state
    pages/      Account, catalog, checkout, and order screens
    services/   API requests
```
