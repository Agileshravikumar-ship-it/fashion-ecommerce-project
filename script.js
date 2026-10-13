const products = [
 {id:1,name:"The Everyday Tee",category:"Women",price:899,oldPrice:1199,label:"BESTSELLER",description:"A soft, relaxed-fit cotton tee you'll reach for every day.",color:"Cloud white",sizes:["XS","S","M","L","XL"],image:"images/product1.jpg"},
 {id:2,name:"Relaxed Linen Shirt",category:"Men",price:1799,oldPrice:2199,label:"NEW",description:"Breathable linen with an easy drape, made for warm days.",color:"Natural beige",sizes:["S","M","L","XL"],image:"images/product2.jpg"},
 {id:3,name:"Weekend Tote",category:"Accessories",price:699,oldPrice:null,label:"EVERYDAY",description:"Your grab-and-go carryall for market runs and mini adventures.",color:"Sand",sizes:["One size"],image:"images/product3.jpg"},
 {id:4,name:"Straight-Leg Denim",category:"Women",price:2299,oldPrice:2799,label:"FAN FAVOURITE",description:"A vintage-inspired straight leg with just the right amount of structure.",color:"Classic blue",sizes:["XS","S","M","L","XL"],image:"images/product4.jpg"},
 {id:5,name:"Everyday Hoodie",category:"Men",price:1899,oldPrice:null,label:"SOFT TOUCH",description:"Your new favourite layer in a substantial, brushed cotton blend.",color:"Moss green",sizes:["S","M","L","XL"],image:"images/product5.jpg"},
 {id:6,name:"Ribbed Tank",category:"Women",price:599,oldPrice:799,label:"2 FOR ₹999",description:"A versatile ribbed tank that works solo or layered up.",color:"Warm cream",sizes:["XS","S","M","L"],image:"images/product6.jpg"},
 {id:7,name:"Classic Overshirt",category:"Men",price:2199,oldPrice:null,label:"NEW",description:"A light layer with clean lines and roomy pockets.",color:"Stone",sizes:["S","M","L","XL"],image:"images/product7.jpg"},
 {id:8,name:"Mini Shoulder Bag",category:"Accessories",price:1299,oldPrice:1599,label:"JUST IN",description:"A compact everyday bag with room for the essentials.",color:"Chocolate",sizes:["One size"],image:"images/product8.jpg"},
 {id:9,name:"Soft Knit Sweater",category:"Women",price:2499,oldPrice:null,label:"COLD WEATHER",description:"A cosy knit with a relaxed silhouette and a soft hand feel.",color:"Oatmeal",sizes:["XS","S","M","L","XL"],image:"images/product9.jpg"},
 {id:10,name:"Everyday Chinos",category:"Men",price:1999,oldPrice:2399,label:"EASY FIT",description:"Smart enough for plans, comfortable enough for every day.",color:"Khaki",sizes:["S","M","L","XL"],image:"images/product10.jpg"},
 {id:11,name:"Minimal Cap",category:"Accessories",price:499,oldPrice:null,label:"DAILY ESSENTIAL",description:"A low-key cotton cap with an adjustable back strap.",color:"Washed black",sizes:["One size"],image:"images/product11.jpg"},
 {id:12,name:"Flowy Midi Skirt",category:"Women",price:1599,oldPrice:1999,label:"BESTSELLER",description:"An easy, swishy midi skirt that moves beautifully with you.",color:"Deep olive",sizes:["XS","S","M","L"],image:"images/product12.jpg"}
];

// Replace a demo image URL if a provider URL is unavailable.
let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let cart = [];
let wishlist = [];
let selectedProduct = null;
let selectedSize = "";
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (amount) => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(amount);

function getVisibleProducts() {
  let list = products.filter(p => (activeCategory === "All" || p.category === activeCategory) &&
    (p.name + " " + p.category + " " + p.description + " " + p.color).toLowerCase().includes(searchTerm.toLowerCase()));
  if (sortMode === "low") list.sort((a,b)=>a.price-b.price);
  if (sortMode === "high") list.sort((a,b)=>b.price-a.price);
  if (sortMode === "name") list.sort((a,b)=>a.name.localeCompare(b.name));
  return list;
}
function renderProducts() {
  const list = getVisibleProducts();
  $("#product-grid").innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='images/product1.jpg'">
        ${p.label ? `<span class="product-label">${p.label}</span>` : ""}
        <button class="heart-button ${wishlist.includes(p.id)?"active":""}" data-wishlist="${p.id}" aria-label="${wishlist.includes(p.id)?"Remove from":"Add to"} wishlist">${wishlist.includes(p.id)?"♥":"♡"}</button>
        <button class="quick-add" data-quick-add="${p.id}">QUICK ADD ＋</button>
      </div>
      <div class="product-info">
        <p class="product-category">${p.category} · ${p.color}</p>
        <div class="product-title-row"><h3 class="product-title">${p.name}</h3><span class="product-price">${money(p.price)}</span></div>
        <p class="product-description">${p.description}</p>
      </div>
    </article>`).join("");
  $("#results-label").textContent = `Showing ${list.length} of ${products.length} pieces`;
  $("#empty-state").classList.toggle("hidden", list.length !== 0);
  $("#product-grid").classList.toggle("hidden", list.length === 0);
  $$(".tab").forEach(tab=>tab.classList.toggle("active",tab.dataset.category===activeCategory));
  updateCounts();
}
function updateCounts() {
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = `(${count})`;
  $("#wishlist-count").textContent = wishlist.length;
  $("#wish-drawer-count").textContent = `(${wishlist.length})`;
}
function showToast(message) {
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2300);
}
function setCategory(category) {
  activeCategory=category; renderProducts();
  if(location.hash!=="#shop") location.hash="shop";
}
function openDrawer(which) {
  closeDrawers();
  $("#overlay").classList.remove("hidden");
  const drawer = which==="cart" ? $("#cart-drawer") : $("#wishlist-drawer");
  drawer.classList.add("open"); drawer.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  if(which==="cart") renderCart(); else renderWishlist();
}
function closeDrawers() {
  $$(".side-drawer").forEach(d=>{d.classList.remove("open");d.setAttribute("aria-hidden","true")});
  $("#overlay").classList.add("hidden");
  document.body.style.overflow="";
}
function addToCart(id,size) {
  const product=products.find(p=>p.id===id);
  const chosenSize=size || product.sizes[0];
  const existing=cart.find(item=>item.id===id && item.size===chosenSize);
  if(existing) existing.qty++; else cart.push({id,size:chosenSize,qty:1});
  updateCounts(); renderCart(); showToast(`${product.name} added to your bag`);
}
function renderCart() {
  const container=$("#cart-items");
  if(!cart.length) {
    container.innerHTML='<div class="drawer-empty"><strong>Your bag is taking a break.</strong>Looks like you haven’t found your favourites yet.<br><br><button class="primary-button" data-close>Explore the collection ↗</button></div>';
  } else {
    container.innerHTML=cart.map(item=>{
      const p=products.find(product=>product.id===item.id);
      return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><p>Size: ${item.size}</p><strong>${money(p.price)}</strong><div class="quantity-controls" style="margin-top:10px"><button data-qty="${p.id}|${item.size}|-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${p.id}|${item.size}|1" aria-label="Increase quantity">+</button></div></div><button class="remove-button" data-remove="${p.id}|${item.size}">Remove</button></div>`;
    }).join("");
  }
  const subtotal=cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0);
  $("#cart-subtotal").textContent=money(subtotal);
  updateCounts();
}
function changeQty(id,size,delta) {
  const item=cart.find(i=>i.id===id && i.size===size);
  if(!item) return;
  item.qty+=delta; if(item.qty<=0) cart=cart.filter(i=>!(i.id===id && i.size===size));
  renderCart(); updateCounts();
}
function renderWishlist() {
  const container=$("#wishlist-items");
  if(!wishlist.length) {
    container.innerHTML='<div class="drawer-empty"><strong>Save what you love.</strong>Tap the heart on any piece to keep it here for later.<br><br><button class="primary-button" data-close>Find your favourites ↗</button></div>';
    return;
  }
  container.innerHTML=wishlist.map(id=>{
    const p=products.find(product=>product.id===id);
    return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><p>${p.category} · ${p.color}</p><strong>${money(p.price)}</strong><br><button class="remove-button" data-wish-remove="${p.id}">Remove from wishlist</button></div><button class="remove-button" data-wish-add="${p.id}">Add to bag</button></div>`;
  }).join("");
}
function toggleWishlist(id) {
  if(wishlist.includes(id)){wishlist=wishlist.filter(x=>x!==id);showToast("Removed from wishlist");}
  else {wishlist.push(id);showToast("Saved to your wishlist ♡");}
  renderProducts(); renderWishlist(); updateCounts();
}
function openProductModal(id) {
  selectedProduct=products.find(p=>p.id===id); selectedSize=selectedProduct.sizes[0];
  const p=selectedProduct;
  $("#product-modal-content").innerHTML=`
    <img class="modal-image" src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='images/product1.jpg'">
    <div class="modal-info"><button class="close-button" data-modal-close aria-label="Close product details">×</button><p class="eyebrow">${p.category} · ${p.color}</p><h2>${p.name}</h2><p class="modal-price">${money(p.price)} ${p.oldPrice?`<span style="font-size:12px;color:#999;text-decoration:line-through;font-weight:400;margin-left:8px">${money(p.oldPrice)}</span>`:""}</p><p>${p.description} Designed to mix, match, and make your own. Easy-care fabric and a comfortable everyday fit.</p><span class="size-label">CHOOSE SIZE</span><div class="size-options">${p.sizes.map((s,i)=>`<button class="size-option ${i===0?"selected":""}" data-size="${s}">${s}</button>`).join("")}</div><button class="primary-button modal-add" id="modal-add">Add to bag — ${money(p.price)} <span>↗</span></button><button class="text-button" id="modal-wishlist" style="margin-top:12px">♡ Save to wishlist</button></div>`;
  $("#product-modal").classList.remove("hidden");
}
function closeModal(){ $("#product-modal").classList.add("hidden"); selectedProduct=null; }
function checkout() {
  if(!cart.length){showToast("Your bag is empty — add something you love first.");return;}
  const total=cart.reduce((sum,item)=>sum+products.find(p=>p.id===item.id).price*item.qty,0);
  alert(`Demo checkout\\n\\nItems: ${cart.reduce((s,i)=>s+i.qty,0)}\\nSubtotal: ${money(total)}\\n\\nThis is a frontend-only practice project. No payment or order will be placed.`);
}
function resetFilters(){activeCategory="All";searchTerm="";sortMode="featured";$("#search-input").value="";$("#sort-select").value="featured";renderProducts();}
function mobileMenuToggle(){
  let panel=$("#mobile-nav-panel");
  if(!panel){panel=document.createElement("nav");panel.id="mobile-nav-panel";panel.className="mobile-nav-panel";panel.innerHTML='<a href="#shop" data-nav-category="All">Shop all</a><a href="#shop" data-nav-category="Men">Men</a><a href="#shop" data-nav-category="Women">Women</a><a href="#shop" data-nav-category="Accessories">Accessories</a>';document.body.appendChild(panel);}
  panel.classList.toggle("hidden");
}

document.addEventListener("click",e=>{
  const categoryLink=e.target.closest("[data-nav-category]");
  if(categoryLink){e.preventDefault();setCategory(categoryLink.dataset.navCategory);$("#mobile-nav-panel")?.classList.add("hidden");}
  const category=e.target.closest("[data-category]");
  if(category){setCategory(category.dataset.category);return;}
  const wish=e.target.closest("[data-wishlist]");
  if(wish){toggleWishlist(Number(wish.dataset.wishlist));return;}
  const quick=e.target.closest("[data-quick-add]");
  if(quick){openProductModal(Number(quick.dataset.quickAdd));return;}
  const size=e.target.closest("[data-size]");
  if(size){selectedSize=size.dataset.size;$$(".size-option").forEach(b=>b.classList.toggle("selected",b.dataset.size===selectedSize));return;}
  const qty=e.target.closest("[data-qty]");
  if(qty){const [id,s,delta]=qty.dataset.qty.split("|");changeQty(Number(id),s,Number(delta));return;}
  const remove=e.target.closest("[data-remove]");
  if(remove){const [id,s]=remove.dataset.remove.split("|");cart=cart.filter(i=>!(i.id===Number(id)&&i.size===s));renderCart();return;}
  const wishRemove=e.target.closest("[data-wish-remove]");
  if(wishRemove){wishlist=wishlist.filter(id=>id!==Number(wishRemove.dataset.wishRemove));renderProducts();renderWishlist();return;}
  const wishAdd=e.target.closest("[data-wish-add]");
  if(wishAdd){const p=products.find(x=>x.id===Number(wishAdd.dataset.wishAdd));addToCart(p.id,p.sizes[0]);return;}
  if(e.target.closest("[data-close]")){closeDrawers();return;}
  if(e.target.closest("[data-modal-close]")){closeModal();return;}
});
$("#search-input").addEventListener("input",e=>{searchTerm=e.target.value;renderProducts();});
$("#sort-select").addEventListener("change",e=>{sortMode=e.target.value;renderProducts();});
$("#clear-filters").addEventListener("click",resetFilters);
$("#empty-reset").addEventListener("click",resetFilters);
$("#cart-open").addEventListener("click",()=>openDrawer("cart"));
$("#wishlist-open").addEventListener("click",()=>openDrawer("wishlist"));
$("#overlay").addEventListener("click",closeDrawers);
$("#search-toggle").addEventListener("click",()=>{$("#search-input").focus();$("#shop").scrollIntoView({behavior:"smooth"});});
$("#mobile-menu").addEventListener("click",mobileMenuToggle);
$("#checkout-button").addEventListener("click",checkout);
$("#product-modal-content").addEventListener("click",e=>{
  if(e.target.id==="modal-add" && selectedProduct){addToCart(selectedProduct.id,selectedSize);closeModal();openDrawer("cart");}
  if(e.target.id==="modal-wishlist" && selectedProduct){toggleWishlist(selectedProduct.id);}
});
$("#newsletter-form").addEventListener("submit",e=>{
  e.preventDefault();const email=$("#email-input").value.trim();
  if(!email){$("#newsletter-message").textContent="Please enter your email address.";return;}
  $("#newsletter-message").textContent=`You're on the list! (Demo signup for ${email})`;$("#newsletter-form").reset();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeDrawers();closeModal();$("#mobile-nav-panel")?.classList.add("hidden");}});
renderProducts();
