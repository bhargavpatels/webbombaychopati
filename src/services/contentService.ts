// Fallback content for when API fails
const FALLBACK_PRIVACY_POLICY = `
<div class="container">
  <h1>Privacy Policy</h1>
  <p>Effective Date: 15/06/2024</p>
  <p>Welcome to Shri Bombay Chowpati (we, our, us). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our shopping app.</p>
  <p>Please contact us at shreebombaychowpati@gmail.com for the complete policy.</p>
</div>
`;

const FALLBACK_TERMS_CONDITIONS = `
<div class="container">
  <h1>Terms & Conditions</h1>
  <p>Effective Date: 15/06/2024</p>
  <p>Welcome to Shri Bombay Chowpati. By using our application, you agree to these terms and conditions.</p>
  <p>Please contact us at shreebombaychowpati@gmail.com for the complete terms and conditions.</p>
</div>
`;

/**
 * Fetch privacy policy from server
 * @returns The privacy policy content
 */
export const fetchPrivacyPolicy = async (): Promise<string> => {
  try {
    const response = await fetch('/api/getPrivacyPolicy.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === "200" && data.PrivacyPolicy) {
      return data.PrivacyPolicy;
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return FALLBACK_PRIVACY_POLICY;
  }
};

/**
 * Fetch terms and conditions from server
 * @returns The terms and conditions content
 */
export const fetchTermsConditions = async (): Promise<string> => {
  try {
    const response = await fetch('/api/getTermsCondition.php', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`Terms API response not OK: ${response.status}`);
      return FALLBACK_TERMS_CONDITIONS;
    }

    const data = await response.json();
    
    // Check all possible field names
    if (data.code === "200") {
      if (data.TermsAndCondition) {
        return data.TermsAndCondition;
      } else if (data.termsCondition) {
        return data.termsCondition;
      } else if (data.TermsCondition) {
        return data.TermsCondition;
      } else if (data.Data && data.Data.termsCondition) {
        return data.Data.termsCondition;
      } else {
        console.error('Terms API response structure unexpected:', data);
        return FALLBACK_TERMS_CONDITIONS;
      }
    } else {
      console.error('Terms API returned non-success code:', data);
      return FALLBACK_TERMS_CONDITIONS;
    }
  } catch (error) {
    console.error('Error fetching terms and conditions:', error);
    return FALLBACK_TERMS_CONDITIONS;
  }
}; 
