
const DashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M216,115.54V208a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V160a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v48a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V115.54a8,8,0,0,1,2.62-5.92l80-75.54a8,8,0,0,1,10.77,0l80,75.54A8,8,0,0,1,216,115.54Z" opacity="0.2"></path><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path></svg>;

const PagesIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M224,56V200a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8H216A8,8,0,0,1,224,56Z" opacity="0.2"></path><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z"></path></svg>

// const TaskIcon = <i className="bx bx-task side-menu__icon"></i>;

const AuthenticationIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M216,96V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H208A8,8,0,0,1,216,96Z" opacity="0.2"></path><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path></svg>

const ErrorIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path></svg>

const UiElementsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M216,96v96a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V96Z" opacity="0.2"></path><path d="M224,48H32A16,16,0,0,0,16,64V88a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,192H48V104H208ZM224,88H32V64H224V88ZM96,136a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,136Z"></path></svg>

const Utilities = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M176,96a48,48,0,1,1-48-48A48,48,0,0,1,176,96Z" opacity="0.2"></path><path d="M216,96A88,88,0,1,0,72,163.83V240a8,8,0,0,0,11.58,7.16L128,225l44.43,22.21A8.07,8.07,0,0,0,176,248a8,8,0,0,0,8-8V163.83A87.85,87.85,0,0,0,216,96ZM56,96a72,72,0,1,1,72,72A72.08,72.08,0,0,1,56,96ZM168,227.06l-36.43-18.21a8,8,0,0,0-7.16,0L88,227.06V174.37a87.89,87.89,0,0,0,80,0ZM128,152A56,56,0,1,0,72,96,56.06,56.06,0,0,0,128,152Zm0-96A40,40,0,1,1,88,96,40,40,0,0,1,128,56Z"></path></svg>

const FormsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M216,48H40a8,8,0,0,0-8,8V216l32-16,32,16,32-16,32,16,32-16,32,16V56A8,8,0,0,0,216,48ZM112,160H64V96h48Z" opacity="0.2"></path><path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.15L64,208.94l28.42,14.21a8,8,0,0,0,7.16,0L128,208.94l28.42,14.21a8,8,0,0,0,7.16,0L192,208.94l28.42,14.21A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM136,112a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H144A8,8,0,0,1,136,112Zm0,32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H144A8,8,0,0,1,136,144ZM64,168h48a8,8,0,0,0,8-8V96a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v64A8,8,0,0,0,64,168Zm8-64h32v48H72Z"></path></svg>

const AdvancedUiIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M58.89,154.89l42.22,42.22-50.63,18.4a7.79,7.79,0,0,1-10-10Zm138.82-4.72L105.83,58.29A7.79,7.79,0,0,0,93,61.14l-14.9,41,75.82,75.82,41-14.9A7.79,7.79,0,0,0,197.71,150.17Z" opacity="0.2"></path><path d="M111.49,52.63a15.8,15.8,0,0,0-26,5.77L33,202.78A15.83,15.83,0,0,0,47.76,224a16,16,0,0,0,5.46-1l144.37-52.5a15.8,15.8,0,0,0,5.78-26Zm-8.33,135.21-35-35,13.16-36.21,58.05,58.05Zm-55,20,14-38.41,24.45,24.45ZM156,168.64,87.36,100l13-35.87,91.43,91.43ZM160,72a37.8,37.8,0,0,1,3.84-15.58C169.14,45.83,179.14,40,192,40c6.7,0,11-2.29,13.65-7.21A22,22,0,0,0,208,23.94,8,8,0,0,1,224,24c0,12.86-8.52,32-32,32-6.7,0-11,2.29-13.65,7.21A22,22,0,0,0,176,72.06,8,8,0,0,1,160,72ZM136,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm101.66,82.34a8,8,0,1,1-11.32,11.31l-16-16a8,8,0,0,1,11.32-11.32Zm4.87-42.75-24,8a8,8,0,0,1-5.06-15.18l24-8a8,8,0,0,1,5.06,15.18Z"></path></svg>

const WidgetsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M208,128v72a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V128Z" opacity="0.2"></path><path d="M216,72H180.92c.39-.33.79-.65,1.17-1A29.53,29.53,0,0,0,192,49.57,32.62,32.62,0,0,0,158.44,16,29.53,29.53,0,0,0,137,25.91a54.94,54.94,0,0,0-9,14.48,54.94,54.94,0,0,0-9-14.48A29.53,29.53,0,0,0,97.56,16,32.62,32.62,0,0,0,64,49.57,29.53,29.53,0,0,0,73.91,71c.38.33.78.65,1.17,1H40A16,16,0,0,0,24,88v32a16,16,0,0,0,16,16v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V136a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM149,36.51a13.69,13.69,0,0,1,10-4.5h.49A16.62,16.62,0,0,1,176,49.08a13.69,13.69,0,0,1-4.5,10c-9.49,8.4-25.24,11.36-35,12.4C137.7,60.89,141,45.5,149,36.51Zm-64.09.36A16.63,16.63,0,0,1,96.59,32h.49a13.69,13.69,0,0,1,10,4.5c8.39,9.48,11.35,25.2,12.39,34.92-9.72-1-25.44-4-34.92-12.39a13.69,13.69,0,0,1-4.5-10A16.6,16.6,0,0,1,84.87,36.87ZM40,88h80v32H40Zm16,48h64v64H56Zm144,64H136V136h64Zm16-80H136V88h80v32Z"></path></svg>

const AppsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M112,56v48a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h48A8,8,0,0,1,112,56Zm88-8H152a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V56A8,8,0,0,0,200,48Zm-96,96H56a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V152A8,8,0,0,0,104,144Zm96,0H152a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V152A8,8,0,0,0,200,144Z" opacity="0.2"></path><path d="M200,136H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48ZM104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Z"></path></svg>

const NestedmenuIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M224,80l-96,56L32,80l96-56Z" opacity="0.2"></path><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"></path></svg>

const TablesIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M88,104v96H32V104Z" opacity="0.2"></path><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z"></path></svg>

const ChartsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M208,40V208H152V40Z" opacity="0.2"></path><path d="M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z"></path></svg>

const MapsIcon = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M128,32a96,96,0,1,0,96,96A96,96,0,0,0,128,32Zm16,112L80,176l32-64,64-32Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z"></path></svg>

const Icons = <svg xmlns="http://www.w3.org/2000/svg" className="side-menu__icon" width="32" height="32" viewBox="0 0 256 256"><path d="M224,96v16a32,32,0,0,1-64,0V96H96v16a32,32,0,0,1-64,0V96L46.34,45.8A8,8,0,0,1,54,40H202a8,8,0,0,1,7.69,5.8Z" opacity="0.2"></path><path d="M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96v16a40,40,0,0,0,16,32v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V144a40,40,0,0,0,16-32ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-48,0v-8ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Zm-8-72a24,24,0,0,1-24-24v-8h48v8A24,24,0,0,1,192,136Z"></path></svg>

const badge = (
  <span className="badge bg-success ms-2 shadow-success">Hot</span>
);
const badge1 = (
  <span className="badge bg-primary ms-2 shadow-primary">8</span>
);
const badge2 = (
  <span className="badge bg-secondary ms-2 shadow-secondary">3</span>
);

export const MenuItems = [
  {
    menutitle: "MAIN",
  },

  {
    icon: DashboardIcon, title: "Dashboards", type: "sub", active: false, selected: false,
    children: [
      { path: `${import.meta.env.BASE_URL}dashboards/sales`, type: "link", active: false, selected: false, dirchange: false, title: "Sales" },
      { path: `${import.meta.env.BASE_URL}dashboards/analytics`, type: "link", active: false, selected: false, dirchange: false, title: "Analytics" },
      { path: `${import.meta.env.BASE_URL}dashboards/ecommerce`, type: "link", active: false, selected: false, dirchange: false, title: "Ecommerce" },
      { path: `${import.meta.env.BASE_URL}dashboards/crm`, type: "link", active: false, selected: false, dirchange: false, title: "CRM" },
      { path: `${import.meta.env.BASE_URL}dashboards/crypto`, type: "link", active: false, selected: false, dirchange: false, title: "Crypto" },
      { path: `${import.meta.env.BASE_URL}dashboards/nft`, type: "link", active: false, selected: false, dirchange: false, title: "NFT" },
      { path: `${import.meta.env.BASE_URL}dashboards/projects`, type: "link", active: false, selected: false, dirchange: false, title: "Projects" },
      { path: `${import.meta.env.BASE_URL}dashboards/jobs`, type: "link", active: false, selected: false, dirchange: false, title: "Jobs" },
      { path: `${import.meta.env.BASE_URL}dashboards/hrm`, type: "link", active: false, selected: false, dirchange: false, title: "HRM" },
      { path: `${import.meta.env.BASE_URL}dashboards/courses`, type: "link", active: false, selected: false, dirchange: false, title: "Courses" },
      { path: `${import.meta.env.BASE_URL}dashboards/stocks`, type: "link", active: false, selected: false, dirchange: false, title: "Stocks" },
      { path: `${import.meta.env.BASE_URL}dashboards/medical`, type: "link", active: false, selected: false, dirchange: false, title: "Medical" },
      { path: `${import.meta.env.BASE_URL}dashboards/pos-system`, type: "link", active: false, selected: false, dirchange: false, title: "POS System" },
      { path: `${import.meta.env.BASE_URL}dashboards/podcast`, type: "link", active: false, selected: false, dirchange: false, title: "Podcast" },
      { path: `${import.meta.env.BASE_URL}dashboards/school`, type: "link", active: false, selected: false, dirchange: false, title: "School" },
      { path: `${import.meta.env.BASE_URL}dashboards/social-media`, type: "link", active: false, selected: false, dirchange: false, title: "Social Media" },
    ],
  },

  {
    menutitle: "WEB APPS",
  },
  {
    title: "Apps", icon: AppsIcon, type: "sub", badgetxt: badge, active: false, selected: false, dirchange: false,
    children: [
      {
        title: "Ecommerce", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          {
            title: "Admin", type: "sub", active: false, selected: false, dirchange: false,
            children: [
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/add-customer`, type: "link", active: false, selected: false, dirchange: false, title: "Add Customer" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/add-products`, type: "link", active: false, selected: false, dirchange: false, title: "Add Product" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/add-vendor`, type: "link", active: false, selected: false, dirchange: false, title: "Add Vendor" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/admin-blog`, type: "link", active: false, selected: false, dirchange: false, title: "Blog" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/customer-details`, type: "link", active: false, selected: false, dirchange: false, title: "Customer Details" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/customer-list`, type: "link", active: false, selected: false, dirchange: false, title: "Customer List" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/faqs`, type: "link", active: false, selected: false, dirchange: false, title: "Faq's" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/news-letter`, type: "link", active: false, selected: false, dirchange: false, title: "News Letter" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/orders`, type: "link", active: false, selected: false, dirchange: false, title: "Orders" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/order-details`, type: "link", active: false, selected: false, dirchange: false, title: "Order Details" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/payment-gateways`, type: "link", active: false, selected: false, dirchange: false, title: "Payment Gateways" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/products`, type: "link", active: false, selected: false, dirchange: false, title: "Products" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/refund-requests`, type: "link", active: false, selected: false, dirchange: false, title: "Refund requests" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/reports`, type: "link", active: false, selected: false, dirchange: false, title: "Reports" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/testimonials`, type: "link", active: false, selected: false, dirchange: false, title: "Testimonials" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/vendor-details`, type: "link", active: false, selected: false, dirchange: false, title: "Vendor Details" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/vendors-list`, type: "link", active: false, selected: false, dirchange: false, title: "Vendors List" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/admin/app-settings`, type: "link", active: false, selected: false, dirchange: false, title: "App Settings" },

            ],
          },

          // Customer
          {
            title: "Customer", type: "sub", active: false, selected: false, dirchange: false,
            children: [
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/customer`, type: "link", active: false, selected: false, dirchange: false, title: "Customer" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/address`, type: "link", active: false, selected: false, dirchange: false, title: "Address" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/landing-page`, type: "link", active: false, selected: false, dirchange: false, title: "Landing Page" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/shop`, type: "link", active: false, selected: false, dirchange: false, title: "Shop" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/product-details`, type: "link", active: false, selected: false, dirchange: false, title: "Product Details" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/cart`, type: "link", active: false, selected: false, dirchange: false, title: "Cart" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/checkout`, type: "link", active: false, selected: false, dirchange: false, title: "Checkout" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/compare-products`, type: "link", active: false, selected: false, dirchange: false, title: "Compare Products" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/coupons`, type: "link", active: false, selected: false, dirchange: false, title: "Coupons" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/order-tracking`, type: "link", active: false, selected: false, dirchange: false, title: "Order Tracking" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/refunds`, type: "link", active: false, selected: false, dirchange: false, title: "Refunds" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/settings`, type: "link", active: false, selected: false, dirchange: false, title: "Settings" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/customer/wishlist`, type: "link", active: false, selected: false, dirchange: false, title: "Wishlist" }

            ],
          },
          //Vendor
          {
            title: "Vendor", type: "sub", active: false, selected: false, dirchange: false,
            children: [
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/vendor`, type: "link", active: false, selected: false, dirchange: false, title: "Vendor" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/add-product`, type: "link", active: false, selected: false, dirchange: false, title: "Add Product" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/invoice-details`, type: "link", active: false, selected: false, dirchange: false, title: "Invoice Details" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/invoices`, type: "link", active: false, selected: false, dirchange: false, title: "Invoices" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/orders`, type: "link", active: false, selected: false, dirchange: false, title: "Orders" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/packages`, type: "link", active: false, selected: false, dirchange: false, title: "Packages" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/profile`, type: "link", active: false, selected: false, dirchange: false, title: "Profile" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/refund-request`, type: "link", active: false, selected: false, dirchange: false, title: "Refund Request" },
              { path: `${import.meta.env.BASE_URL}apps/ecommerce/vendor/vendor-settings`, type: "link", active: false, selected: false, dirchange: false, title: "Settings" },

            ],
          },

        ],
      },
      //Classifieds

      {
        title: "Classifieds", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/classifieds/admin`, type: "link", active: false, selected: false, dirchange: false, title: "Admin" },
          { path: `${import.meta.env.BASE_URL}apps/classifieds/classified-details`, type: "link", active: false, selected: false, dirchange: false, title: "Classified Details" },
          { path: `${import.meta.env.BASE_URL}apps/classifieds/classi-landing`, type: "link", active: false, selected: false, dirchange: false, title: "Landing" },
          { path: `${import.meta.env.BASE_URL}apps/classifieds/classi-search`, type: "link", active: false, selected: false, dirchange: false, title: "Search" },
          { path: `${import.meta.env.BASE_URL}apps/classifieds/user-profile`, type: "link", active: false, selected: false, dirchange: false, title: "User Profile" }
        ],
      },
      //Domain

      {
        title: "Domain", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/domain/domain-admin`, type: "link", active: false, selected: false, dirchange: false, title: "Admin" },
          { path: `${import.meta.env.BASE_URL}apps/domain/single-landing`, type: "link", active: false, selected: false, dirchange: false, title: "Single Landing" },
          { path: `${import.meta.env.BASE_URL}apps/domain/domain-details`, type: "link", active: false, selected: false, dirchange: false, title: "Domain Details" },
          { path: `${import.meta.env.BASE_URL}apps/domain/landing`, type: "link", active: false, selected: false, dirchange: false, title: "Landing" },

        ],
      },
      //Marketplace

      {
        title: "Market Place", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/market-place/market-admin`, type: "link", active: false, selected: false, dirchange: false, title: "Admin" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/details`, type: "link", active: false, selected: false, dirchange: false, title: "Details" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/landing`, type: "link", active: false, selected: false, dirchange: false, title: "Landing" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/market-search`, type: "link", active: false, selected: false, dirchange: false, title: "Search" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/user`, type: "link", active: false, selected: false, dirchange: false, title: "User" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/user-profile`, type: "link", active: false, selected: false, dirchange: false, title: "User Profile" },
          { path: `${import.meta.env.BASE_URL}apps/market-place/market-vendor`, type: "link", active: false, selected: false, dirchange: false, title: "Vendor" },

        ],
      },

      //Real Estate

      {
        title: "Real Estate", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-admin`, type: "link", active: false, selected: false, dirchange: false, title: "Admin" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-details`, type: "link", active: false, selected: false, dirchange: false, title: "Details" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-landing`, type: "link", active: false, selected: false, dirchange: false, title: "Landing" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-search`, type: "link", active: false, selected: false, dirchange: false, title: "Search" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-user`, type: "link", active: false, selected: false, dirchange: false, title: "User" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-userprofile`, type: "link", active: false, selected: false, dirchange: false, title: "User Profile" },
          { path: `${import.meta.env.BASE_URL}apps/real-estate/real-vendor`, type: "link", active: false, selected: false, dirchange: false, title: "Vendor" },

        ],
      },

      { path: `${import.meta.env.BASE_URL}apps/full-calendar`, type: "link", active: false, selected: false, dirchange: false, title: "Full Calendar" },
      { path: `${import.meta.env.BASE_URL}apps/gallery`, type: "link", active: false, selected: false, dirchange: false, title: "Gallery" },
      { path: `${import.meta.env.BASE_URL}apps/sweet-alerts`, type: "link", active: false, selected: false, dirchange: false, title: "Sweet Alerts" },

      {
        title: "Projects", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/projects/project-list`, type: "link", active: false, selected: false, dirchange: false, title: "Project List" },
          { path: `${import.meta.env.BASE_URL}apps/projects/project-overview`, type: "link", active: false, selected: false, dirchange: false, title: "Project Overview" },
          { path: `${import.meta.env.BASE_URL}apps/projects/create-project`, type: "link", active: false, selected: false, dirchange: false, title: "Create Project" },
        ],
      },

      {
        title: "Task", type: "sub", active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/task/kanban-board`, type: "link", active: false, selected: false, dirchange: false, title: "Kanban Board" },
          { path: `${import.meta.env.BASE_URL}apps/task/list-view`, type: "link", active: false, selected: false, dirchange: false, title: "List View" },
          { path: `${import.meta.env.BASE_URL}apps/task/task-details`, type: "link", active: false, selected: false, dirchange: false, title: "Task Details" },
        ],
      },

      {
        title: "Jobs", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/jobs/job-details`, type: "link", active: false, selected: false, dirchange: false, title: "Job Details" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/search-company`, type: "link", active: false, selected: false, dirchange: false, title: "Search Company" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/search-jobs`, type: "link", active: false, selected: false, dirchange: false, title: "Search Jobs" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/job-post`, type: "link", active: false, selected: false, dirchange: false, title: " Job Post" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/jobs-list`, type: "link", active: false, selected: false, dirchange: false, title: " Jobs List" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/search-candidates`, type: "link", active: false, selected: false, dirchange: false, title: " Search Candidate" },
          { path: `${import.meta.env.BASE_URL}apps/jobs/candidate-details`, type: "link", active: false, selected: false, dirchange: false, title: "Candidate details" },
        ],
      },

      {
        title: "NFT", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/nft/market-place`, type: "link", active: false, selected: false, dirchange: false, title: "Market Place" },
          { path: `${import.meta.env.BASE_URL}apps/nft/nft-details`, type: "link", active: false, selected: false, dirchange: false, title: "NFT Details" },
          { path: `${import.meta.env.BASE_URL}apps/nft/create-nft`, type: "link", active: false, selected: false, dirchange: false, title: "Create NFT" },
          { path: `${import.meta.env.BASE_URL}apps/nft/wallet-integration`, type: "link", active: false, selected: false, dirchange: false, title: " Wallet Integration" },
          { path: `${import.meta.env.BASE_URL}apps/nft/live-auction`, type: "link", active: false, selected: false, dirchange: false, title: "Live Auction" },
        ],
      },
      {
        title: "CRM", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/crm/crm-contacts`, type: "link", active: false, selected: false, dirchange: false, title: "Contacts" },
          { path: `${import.meta.env.BASE_URL}apps/crm/companies`, type: "link", active: false, selected: false, dirchange: false, title: "Companies" },
          { path: `${import.meta.env.BASE_URL}apps/crm/deals`, type: "link", active: false, selected: false, dirchange: false, title: "Deals" },
          { path: `${import.meta.env.BASE_URL}apps/crm/leads`, type: "link", active: false, selected: false, dirchange: false, title: " Leads" },
        ],
      },
      {
        title: "Crypto", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}apps/crypto/transactions`, type: "link", active: false, selected: false, dirchange: false, title: "Transactions" },
          { path: `${import.meta.env.BASE_URL}apps/crypto/currency-exchange`, type: "link", active: false, selected: false, dirchange: false, title: "Currency Exchanges" },
          { path: `${import.meta.env.BASE_URL}apps/crypto/buy-sell`, type: "link", active: false, selected: false, dirchange: false, title: "Buy & Sell" },
          { path: `${import.meta.env.BASE_URL}apps/crypto/marketcap`, type: "link", active: false, selected: false, dirchange: false, title: " Marketcap" },
          { path: `${import.meta.env.BASE_URL}apps/crypto/wallet`, type: "link", active: false, selected: false, dirchange: false, title: "Wallet" },
        ],
      },
    ],
  },

  {
    icon: NestedmenuIcon,
    title: "Nested Menu",
    selected: false,
    active: false,
    type: "sub",
    children: [
      {
        path: "",
        title: "Nested-1",
        type: "empty",
        active: false,
        selected: false,
        dirchange: false,
      },

      {
        title: "Nested-2",
        type: "sub",
        active: false,
        selected: false,
        dirchange: false,
        children: [
          {
            path: "",
            type: "empty",
            active: false,
            selected: false,
            dirchange: false,
            title: "Nested-2-1",
          },
          {
            path: "",
            type: "empty",
            ctive: false,
            selected: false,
            dirchange: false,
            title: "Nested-2-2",
          },
          {
            path: "",
            type: "empty",
            active: false,
            selected: false,
            dirchange: false,
            title: "Nested-2-3",
          },
        ],
      },
    ],
  },

  {
    menutitle: "PAGES",
  },
  // Authentication
  {
    icon: AuthenticationIcon, title: " Authentication", badgetxt: badge1, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}authentication/coming-soon`, type: "link", active: false, selected: false, dirchange: false, title: "Coming Soon" },

      {
        title: "Create Password", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/create-password/create-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/create-password/create-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      {
        title: "Lock Screen", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/lock-screen/lock-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/lock-screen/lock-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      {
        title: "Reset Password", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/reset-password/reset-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/reset-password/reset-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      {
        title: "Sign Up", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/sign-up/sign-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/sign-up/sign-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      {
        title: "Sign In", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/sign-in/signin-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/sign-in/signin-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      {
        title: "Two Step Verification", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}authentication/twostep-verification/two-basic`, type: "link", active: false, selected: false, dirchange: false, title: "Basic" },
          { path: `${import.meta.env.BASE_URL}authentication/twostep-verification/two-cover`, type: "link", active: false, selected: false, dirchange: false, title: "Cover" },
        ],
      },
      { path: `${import.meta.env.BASE_URL}authentication/under-maintenance`, type: "link", active: false, selected: false, dirchange: false, title: "Under Maintainance" },
    ],
  },

  {
    icon: ErrorIcon, title: "Error", badgetxt: badge2, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}error/401-error`, type: "link", active: false, selected: false, dirchange: false, title: "401-Error" },
      { path: `${import.meta.env.BASE_URL}error/404-error`, type: "link", active: false, selected: false, dirchange: false, title: "404-Error" },
      { path: `${import.meta.env.BASE_URL}error/500-error`, type: "link", active: false, selected: false, dirchange: false, title: "500-Error" },
    ],
  },

  //Pages
  {
    icon: PagesIcon, title: "Pages", type: "sub", active: false, selected: false,
    children: [
      {
        title: "Blog", type: "sub", active: false, selected: false,
        children: [
          { path: `${import.meta.env.BASE_URL}pages/blog/blog`, type: "link", active: false, selected: false, dirchange: false, title: "Blog" },
          { path: `${import.meta.env.BASE_URL}pages/blog/blog-details`, type: "link", active: false, selected: false, dirchange: false, title: "Blog-Details" },
          { path: `${import.meta.env.BASE_URL}pages/blog/create-blog`, type: "link", active: false, selected: false, dirchange: false, title: "Create-Blog" },
        ],
      },
      { path: `${import.meta.env.BASE_URL}pages/chat`, type: "link", active: false, selected: false, dirchange: false, title: "Chat" },

      {
        title: "Email", type: "sub", active: false,
        children: [
          { path: `${import.meta.env.BASE_URL}pages/email/mail-app`, type: "link", active: false, selected: false, dirchange: false, title: "Mail-App" },
          { path: `${import.meta.env.BASE_URL}pages/email/mail-settings`, type: "link", active: false, selected: false, dirchange: false, title: "Mail-Settings" },
        ],
      },

      { path: `${import.meta.env.BASE_URL}pages/empty`, type: "link", active: false, selected: false, dirchange: false, title: "Empty" },
      { path: `${import.meta.env.BASE_URL}pages/faqs`, type: "link", active: false, selected: false, dirchange: false, title: "FAQ's" },
      { path: `${import.meta.env.BASE_URL}pages/file-manager`, type: "link", active: false, selected: false, dirchange: false, title: "File Manager" },

      {
        title: "Invoice", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}pages/invoice/create-invoice`, type: "link", active: false, selected: false, dirchange: false, title: "Create Invoice" },
          { path: `${import.meta.env.BASE_URL}pages/invoice/invoice-details`, type: "link", active: false, selected: false, dirchange: false, title: "Invoice Details" },
          { path: `${import.meta.env.BASE_URL}pages/invoice/invoice-list`, type: "link", active: false, selected: false, dirchange: false, title: "Invoice List" },
        ]
      },

      { path: `${import.meta.env.BASE_URL}pages/pricing`, type: "link", active: false, selected: false, dirchange: false, title: "Pricing" },
      { path: `${import.meta.env.BASE_URL}pages/profile`, type: "link", active: false, selected: false, dirchange: false, title: "Profile" },
      { path: `${import.meta.env.BASE_URL}pages/profile-settings`, type: "link", active: false, selected: false, dirchange: false, title: "Profile Settings" },
      { path: `${import.meta.env.BASE_URL}pages/reviews`, type: "link", active: false, selected: false, dirchange: false, title: "Reviews" },
      { path: `${import.meta.env.BASE_URL}pages/search`, type: "link", active: false, selected: false, dirchange: false, title: "Search" },
      { path: `${import.meta.env.BASE_URL}pages/team`, type: "link", active: false, selected: false, dirchange: false, title: "Team" },
      { path: `${import.meta.env.BASE_URL}pages/terms-conditions`, type: "link", active: false, selected: false, dirchange: false, title: "Terms & Conditions" },
      { path: `${import.meta.env.BASE_URL}pages/timeline`, type: "link", active: false, selected: false, dirchange: false, title: "Timeline" },
      { path: `${import.meta.env.BASE_URL}pages/todolist`, type: "link", active: false, selected: false, dirchange: false, title: "To Do List" },

    ],
  },

  {
    menutitle: "GENERAL",
  },
  // Forms
  {
    title: "Forms", icon: FormsIcon, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}forms/form-advanced`, type: "link", active: false, selected: false, dirchange: false, title: "Form Advanced" },
      {
        title: "Form Elements", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}forms/form-elements/inputs`, type: "link", active: false, selected: false, dirchange: false, title: "Inputs" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/check-radios`, type: "link", active: false, selected: false, dirchange: false, title: "Checks & Radios " },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/input-group`, type: "link", active: false, selected: false, dirchange: false, title: "Input Group" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/form-select`, type: "link", active: false, selected: false, dirchange: false, title: "Form Select" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/range-slider`, type: "link", active: false, selected: false, dirchange: false, title: "Range Slider" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/input-masks`, type: "link", active: false, selected: false, dirchange: false, title: "Input masks" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/file-uploads`, type: "link", active: false, selected: false, dirchange: false, title: "File Uploads" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/date-time-picker`, type: "link", active: false, selected: false, dirchange: false, title: "Date,Time Picker" },
          { path: `${import.meta.env.BASE_URL}forms/form-elements/color-pickers`, type: "link", active: false, selected: false, dirchange: false, title: "Color Pickers" },
        ],
      },
      { path: `${import.meta.env.BASE_URL}forms/floating-labels`, type: "link", active: false, selected: false, dirchange: false, title: "Floating Labels" },
      { path: `${import.meta.env.BASE_URL}forms/form-layouts`, type: "link", active: false, selected: false, dirchange: false, title: "Form Layouts" },
      { path: `${import.meta.env.BASE_URL}forms/form-wizards`, type: "link", active: false, selected: false, dirchange: false, title: "Form Wizards" },
      { path: `${import.meta.env.BASE_URL}forms/quill-editors`, type: "link", active: false, selected: false, dirchange: false, title: "Sun Editor" },
      { path: `${import.meta.env.BASE_URL}forms/validation`, type: "link", active: false, selected: false, dirchange: false, title: "Validation" },
      { path: `${import.meta.env.BASE_URL}forms/select2`, type: "link", active: false, selected: false, dirchange: false, title: "Select2" },
    ],
  },
  // Uielements
  {
    title: "Ui Elements", icon: UiElementsIcon, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}ui-elements/alerts`, type: "link", active: false, selected: false, dirchange: false, title: "Alerts" },
      { path: `${import.meta.env.BASE_URL}ui-elements/badge`, type: "link", active: false, selected: false, dirchange: false, title: "Badge" },
      { path: `${import.meta.env.BASE_URL}ui-elements/breadcrumbs`, type: "link", active: false, selected: false, dirchange: false, title: "Breadcrumb" },
      { path: `${import.meta.env.BASE_URL}ui-elements/buttons`, type: "link", active: false, selected: false, dirchange: false, title: "Buttons" },
      { path: `${import.meta.env.BASE_URL}ui-elements/button-group`, type: "link", active: false, selected: false, dirchange: false, title: "Button Group" },
      { path: `${import.meta.env.BASE_URL}ui-elements/cards`, type: "link", active: false, selected: false, dirchange: false, title: "Cards" },
      { path: `${import.meta.env.BASE_URL}ui-elements/dropdowns`, type: "link", active: false, selected: false, dirchange: false, title: "Dropdowns" },
      { path: `${import.meta.env.BASE_URL}ui-elements/images-figures`, type: "link", active: false, selected: false, dirchange: false, title: "Images & Figures" },
      { path: `${import.meta.env.BASE_URL}ui-elements/links-interactions`, type: "link", active: false, selected: false, dirchange: false, title: "Links & Interactions" },
      { path: `${import.meta.env.BASE_URL}ui-elements/list-group`, type: "link", active: false, selected: false, dirchange: false, title: "List Group" },
      { path: `${import.meta.env.BASE_URL}ui-elements/navs-tabs`, type: "link", active: false, selected: false, dirchange: false, title: "Navs & Tabs" },
      { path: `${import.meta.env.BASE_URL}ui-elements/object-fit`, type: "link", active: false, selected: false, dirchange: false, title: "Object Fit" },
      { path: `${import.meta.env.BASE_URL}ui-elements/pagination`, type: "link", active: false, selected: false, dirchange: false, title: "Pagination" },
      { path: `${import.meta.env.BASE_URL}ui-elements/popovers`, type: "link", active: false, selected: false, dirchange: false, title: "Popovers" },
      { path: `${import.meta.env.BASE_URL}ui-elements/progress`, type: "link", active: false, selected: false, dirchange: false, title: "Progress" },
      { path: `${import.meta.env.BASE_URL}ui-elements/spinners`, type: "link", active: false, selected: false, dirchange: false, title: "Spinners" },
      { path: `${import.meta.env.BASE_URL}ui-elements/toasts`, type: "link", active: false, selected: false, dirchange: false, title: "Toasts" },
      { path: `${import.meta.env.BASE_URL}ui-elements/tooltips`, type: "link", active: false, selected: false, dirchange: false, title: "Tooltips" },
      { path: `${import.meta.env.BASE_URL}ui-elements/typography`, type: "link", active: false, selected: false, dirchange: false, title: "Typography" },
    ],
  },

  // Advancedui
  {
    title: "Advanced Ui", icon: AdvancedUiIcon, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}advanced-ui/accordions-collapse`, type: "link", active: false, selected: false, dirchange: false, title: "Accordions & collapse" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/carousel`, type: "link", active: false, selected: false, dirchange: false, title: "Carousel" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/draggable-cards`, type: "link", active: false, selected: false, dirchange: false, title: "Draggable Cards" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/media-player`, type: "link", active: false, selected: false, dirchange: false, title: "Media Player" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/modals-closes`, type: "link", active: false, selected: false, dirchange: false, title: "Modals & Closes" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/navbar`, type: "link", active: false, selected: false, dirchange: false, title: "Navbar" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/offcanvas`, type: "link", active: false, selected: false, dirchange: false, title: "Offcanvas" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/placeholders`, type: "link", active: false, selected: false, dirchange: false, title: "Placeholders" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/ratings`, type: "link", active: false, selected: false, dirchange: false, title: "Ratings" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/ribbons`, type: "link", active: false, selected: false, dirchange: false, title: "Ribbons" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/swiper-js`, type: "link", active: false, selected: false, dirchange: false, title: "Swiper JS" },
      { path: `${import.meta.env.BASE_URL}advanced-ui/tour`, type: "link", active: false, selected: false, dirchange: false, title: "Tour" },
    ],
  },
  // Utilities
  {
    title: "Utilities", icon: Utilities, type: "sub", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}utilities/avatars`, type: "link", active: false, selected: false, dirchange: false, title: "Avatars" },
      { path: `${import.meta.env.BASE_URL}utilities/borders`, type: "link", active: false, selected: false, dirchange: false, title: "Borders" },
      { path: `${import.meta.env.BASE_URL}utilities/breakpoints`, type: "link", active: false, selected: false, dirchange: false, title: "Breakpoints" },
      { path: `${import.meta.env.BASE_URL}utilities/colors`, type: "link", active: false, selected: false, dirchange: false, title: "Colors" },
      { path: `${import.meta.env.BASE_URL}utilities/columns`, type: "link", active: false, selected: false, dirchange: false, title: "Columns" },
      { path: `${import.meta.env.BASE_URL}utilities/css-grid`, type: "link", active: false, selected: false, dirchange: false, title: "Css Grids" },
      { path: `${import.meta.env.BASE_URL}utilities/flex`, type: "link", active: false, selected: false, dirchange: false, title: "Flex" },
      { path: `${import.meta.env.BASE_URL}utilities/gutters`, type: "link", active: false, selected: false, dirchange: false, title: "Gutters" },
      { path: `${import.meta.env.BASE_URL}utilities/helpers`, type: "link", active: false, selected: false, dirchange: false, title: "Helpers" },
      { path: `${import.meta.env.BASE_URL}utilities/position`, type: "link", active: false, selected: false, dirchange: false, title: "Position" },
      { path: `${import.meta.env.BASE_URL}utilities/additional-content`, type: "link", active: false, selected: false, dirchange: false, title: "Additional Content" },
    ],
  },

  { path: `${import.meta.env.BASE_URL}widgets`, title: "widgets", icon: WidgetsIcon, type: "link", active: false, selected: false, dirchange: false },
  // Maps
  { menutitle: "MAPS & ICONS" },
  {
    title: "Maps", icon: MapsIcon, type: "sub", background: "hor-rightangle", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}maps/leaflet-maps`, type: "link", active: false, selected: false, dirchange: false, title: "Leaflet Maps" },
      { path: `${import.meta.env.BASE_URL}maps/vector-maps`, type: "link", active: false, selected: false, dirchange: false, title: "Vector Maps" },
    ],
  },
  { path: `${import.meta.env.BASE_URL}icons`, icon: Icons, type: "link", active: false, selected: false, dirchange: false, title: "Icons" },

  {
    menutitle: "TABLES & CHARTS",
  },
  // Charts
  {
    title: "Charts", icon: ChartsIcon, type: "sub", selected: false, active: false,
    children: [
      {
        title: "Apex Charts", type: "sub", menusub: true, active: false, selected: false, dirchange: false,
        children: [
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/line-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Line Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/area-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Area Charts " },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/columns-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Column Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/bar-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Bar Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/mixed-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Mixed Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/range-area-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Range Area Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/timeline-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Timeline Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/funnel-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Funnel Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/candlestick-charts`, type: "link", active: false, selected: false, dirchange: false, title: "CandleStick Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/boxplot-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Boxplot Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/bubble-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Bubble Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/scatter-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Scatter Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/heatmap-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Heatmap Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/treemap-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Treemap Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/pie-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Pie Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/radialbar-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Radialbar Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/radar-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Radar Charts" },
          { path: `${import.meta.env.BASE_URL}charts/apex-charts/polararea-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Polararea Charts" },
        ],
      },
      { path: `${import.meta.env.BASE_URL}charts/chartjs-charts`, type: "link", active: false, selected: false, dirchange: false, title: "ChartJS Charts" },
      { path: `${import.meta.env.BASE_URL}charts/echarts-charts`, type: "link", active: false, selected: false, dirchange: false, title: "Echart Charts" },
    ],
  },
  // Tables
  {
    title: "Tables", icon: TablesIcon, type: "sub", menutitle: "", active: false, selected: false, dirchange: false,
    children: [
      { path: `${import.meta.env.BASE_URL}tables/tables`, type: "link", active: false, selected: false, dirchange: false, title: "Tables" },
      { path: `${import.meta.env.BASE_URL}tables/gridjs-tables`, type: "link", active: false, selected: false, dirchange: false, title: "Grid JS Tables" },
      { path: `${import.meta.env.BASE_URL}tables/data-tables`, type: "link", active: false, selected: false, dirchange: false, title: "Data Tables" },
    ],
  },

];
