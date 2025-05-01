// API URLs configuration
export const ApiUrls = {
  // Use relative path in production, direct URL in development
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://shribombaychowpati.com/AdminPanel/WebApi/'  // Use direct URL in production for now
    : 'https://shribombaychowpati.com/AdminPanel/WebApi/', 
    //  // Direct URL in development
  oneSignal: '0d82d150-80a3-4c4f-a3b3-51cba3bf3410',

  // Auth endpoints
  login: 'Login.php',
  signUp: 'SignUp.php',
  getUserDetail: 'getUserDetail.php',
  editProfile: 'editProfile.php',
  changePassword: 'changePassword.php', // Fixed the endpoint to match API convention
  checkPhone: 'checkPhone.php',
  resetPassword: 'resetPassword.php',
  logout: 'logout.php',
  deleteAccount: 'deleteAccount.php',
  
  // Product endpoints
  getProducts: 'getProducts.php',
  getConeCandy: 'getConeCandy.php',
  addToCart: 'addToCart.php',
  
  // Address endpoints
  getAddress: 'getAddress.php',
  addAddress: 'addAddress.php',
  editAddress: 'editAddress.php',
  deleteAddress: 'deleteAddress.php',
  makeDefaultAddress: 'makeDefaultAddress.php',
  getPinCodes: 'getPinCodes.php',
  
  // Order endpoints
  createOrder: 'createOrder.php',
  getOrders: 'getOrders.php',
  cancelOrder: 'cancelOrder.php',
  
  // Content endpoints
  getPrivacyPolicy: 'getPrivacyPolicy.php',
  getTermsCondition: 'getTermsCondition.php',
};

// API request parameters keys
export const ApiKeys = {
  userId: "userId",
  phone: "phone",
  password: "password",
  name: "name",
  email: "email",
  fcmToken: "FCMToken",
  oldPassword: "oldPassword",
  newPassword: "newPassword",
  address: "address",
  pinCode: "pinCode",
  addressId: "addressId",
  totalAmount: "totalAmount",
  orderMeta: "orderMeta",
  pid: "pid",
  pMetaId: "pMetaId",
  quantity: "quantity",
  amount: "amount",
  orderId: "orderId",
};

// App constants
export const AppConstants = {
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.order.bombaychowpati",
  appStoreUrl: "https://apps.apple.com/app/bombaychowpati/id6560114187",
  appFontFamily: "Montserrat",
  poweredBy: "Mindwave Infoway",
  copyRightYear: "2024",
};

// App strings used throughout the application
export const AppStrings = {
  appName: "Bombay Chowpati",
  login: "Login",
  signUp: "Sign Up",
  areYouSureYouWantToExitTheApp: "Are you sure you want to exit the app?",
  no: "No",
  yesExit: "Yes, exit",
  temporaryServiceIsNotAvailable: "Temporary service is not available.",
  hello: "Hello ",
  noDataFound: "No data found",
  settings: "Settings",
  logOut: "Log Out",
  copyrightContext: "2024 Mindwave Infoway",
  poweredByMindwaveInfoway: "powered by Mindwave Infoway",
  
  // Form related strings
  enterEmailPhoneNumber: "Enter email / phone number",
  pleaseEnterEmailPhoneNumber: "Please enter email / phone number",
  password: "Password",
  enterPassword: "Enter password",
  pleaseEnterPassword: "Please enter password",
  passwordMustContain: "Password must contain at least one lowercase letter, uppercase letter, number, and special character minimum length 8.",
  enterConfirmPassword: "Enter confirm password",
  pleaseEnterConfirmPassword: "Please enter confirm password",
  passwordDidNotMatch: "Password did not match",
  enterEmailAddress: "Enter email address",
  pleaseEnterEmailAddress: "Please enter email address",
  invalidEmailAddress: "Invalid email address",
  enterPhoneNumber: "Enter phone number",
  pleaseEnterPhoneNumber: "Please enter phone number",
  pleaseEnterValidPhoneNumber: "Please enter valid phone number",
  enterPhoneNumberOptional: "Enter phone number (Optional)",
  
  // Address related strings
  addNewAddress: "Add New Address",
  editAddress: "Edit Address",
  enterAddress: "Enter Address",
  selectPinCode: "Select Pin Code",
  
  // Order related strings
  createOrder: "Create Order",
  quantity: "Quantity",
  enterQuantity: "Enter quantity",
  pleaseEnterQuantity: "Please enter quantity",
  orderDetails: "Order Details",
  placeOrder: "Place Order",
  orderDate: "Order date",
  status: "Status",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  
  // Other UI strings
  add: "Add",
  edit: "Edit",
  cancel: "Cancel",
  delete: "Delete",
  update: "Update",
  search: "Search",
  invalidInputs: "Invalid inputs",
  selectOrCaptureAImage: "Select or Capture a Image",
  select: "Select",
  camera: "Camera",
  gallery: "Gallery",
  remove: "Remove",
  successfullyDownloadedAtDownloadFolder: "Successfully downloaded at 'Download' folder.",
  downloadFailedPleaseTryAgain: "Download failed, Please try again.",
  contact: "Contact",
  contactNumber: "Contact Number",
  enterContactNumber: "Enter contact number",
  pleaseEnterContactNumber: "Please enter contact number",
  
  // Additional UI strings
  newVersionAvailable: "A new version is available. Please upgrade to it.",
  forgotPassword: "Forgot password?",
  or: "Or",
  sendCode: "Send code",
  pleaseEnterCode: "Please enter code",
  invalidCode: "Invalid code",
  resend: "Resend",
  reset: "Reset",
  confirm: "Confirm",
  verify: "Verify",
  resetPassword: "Reset\npassword",
  enterYourName: "Enter your name",
  pleaseEnterYourName: "Please enter your name",
  createAccount: "Create account",
  alreadyAMember: "Already a Member? ",
  register: "Register",
  personalDetails: "Personal Details",
  changePassword: "Change Password",
  
  // Welcome page strings
  welcomePageTitleOne: "VANILLA CHOCOLATE HONEY WITH THE CHERRY ON TOP",
  welcomePageSubtitleOneTwo: "It's summer time",
  welcomePageTitleTwo: "ENJOY YOUR FAVOURITE ICE CREAM FLAVOUR",
  welcomePageTitleThree: "A FLAVOUR THAT FITS YOUR SPECIAL DAY",
  welcomePageSubtitleThree: "Come and chase me",
  
  // Product related strings
  cart: "Cart",
  orderHistory: "Order history",
  favourite: "Favourite",
  selectSize: "Select size",
  mrp: "MRP: ",
  totalAmount: "Total amount: ",
  productAdded: "Product added",
  productsAdded: "Products added",
  viewCart: "View Cart",
  viewProducts: "View Products",
  totalPayableAmount: "Total payable amount: ",
  offerOfferOffer: "Offer! Offer! Offer! Considering wholesale price on more than 10 ltr of purchase on every product."
};

// Create a simple storage service with local storage
export const StorageService = {
  setData: (key: string, value: any): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },
  
  getInt: (key: string): number | null => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      return value ? parseInt(value, 10) : null;
    }
    return null;
  },
  
  getString: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return value;
      }
    }
    return null;
  },
  
  getBool: (key: string): boolean | null => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      if (value === 'true') return true;
      if (value === 'false') return false;
      return null;
    }
    return null;
  },
  
  getDouble: (key: string): number | null => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      return value ? parseFloat(value) : null;
    }
    return null;
  },
  
  getData: (key: string): any => {
    if (typeof window !== 'undefined') {
      const value = localStorage.getItem(key);
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return value;
      }
    }
    return null;
  },
  
  removeData: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
  
  clearData: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
};



