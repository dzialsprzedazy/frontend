<script setup></script>

<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <a href="#" class="logo">Shop Kotika</a>
            <div class="contact-info">
              <p>Contact Info</p>
              <p>Stefana Banacha 22, Lodz, Poland</p>
              <p>+48 591 182 321</p>
              <p>shop@kotika.com</p>
            </div>
          </div>

          <div class="footer-col">
            <h3>Customer Care</h3>
            <ul>
              <li><a href="#">My Account</a></li>
              <li><a href="#">Discount</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Orders History</a></li>
              <li><a href="#">Order Tracking</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Pages</h3>
            <ul>
              <li><a href="#">Browse the Shop</a></li>
              <li><a href="#">Category</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container bottom-content">
        <p>© Shop Kotika - All Rights Reserved</p>
        <div class="social-links">
          <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#"><i class="fa-brands fa-instagram"></i></a>
          <a href="#"><i class="fa-brands fa-twitter"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid #ccc;

  color: #8a8fb9;
  font-size: 14px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-top {
  background-color: #f3f4fb;
  padding: 60px 0;
}

.footer-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: space-between;
}

.footer-col {
  flex: 1;
  min-width: 180px;
}

.brand-col {
  flex: 2;
  min-width: 300px;
}

.logo {
  display: inline-block;
  font-size: 28px;
  font-weight: 800;
  color: #0a0a2a;
  text-decoration: none;
  margin-bottom: 20px;
}

.subscribe-form {
  display: flex;
  margin-bottom: 25px;
  max-width: 350px;
}

.subscribe-form input {
  padding: 10px 12px;
  border: none;
  border-radius: 3px 0 0 3px;
  background-color: #ffffff;
  color: #8a8fb9;
  outline: none;
  flex-grow: 1;
  font-family: inherit;
  font-size: 13px;
}

.subscribe-form button {
  padding: 10px 20px;
  background-color: #ed4c8b;
  color: #ffffff;
  border: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: inherit;
  font-size: 13px;
}

.subscribe-form button:hover {
  background-color: #d63d7a;
}

.contact-info p {
  margin-bottom: 8px;
  line-height: 1.5;
}

.footer-col h3 {
  color: #0a0a2a;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-col ul li {
  margin-bottom: 12px;
}

.footer-col ul a {
  color: #8a8fb9;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-col ul a:hover {
  color: #ed4c8b;
}

.footer-bottom {
  background-color: #e6e7f0;
  padding: 12px 0;
}

.bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.bottom-content p {
  color: #636682;
  font-size: 14px;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-links a {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  background-color: #151875;
  color: #ffffff;
  border-radius: 50%;
  text-decoration: none;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.social-links a:hover {
  background-color: #ed4c8b;
}

@media (max-width: 992px) {
  .footer-grid {
    gap: 30px;
  }
  .brand-col {
    min-width: 100%;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    flex-direction: column;
  }
  .bottom-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
