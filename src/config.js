// ⚠️ INTENTIONAL SECURITY ISSUE FOR DEMO PURPOSES
// This file contains hardcoded secrets to demonstrate Gitleaks detection

module.exports = {
  // BAD PRACTICE: Hardcoded API key (Gitleaks will detect this!)
  API_KEY: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',

  // BAD PRACTICE: Hardcoded AWS credentials (for demo)
  AWS_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',

  // Other config
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// TODO: Fix this by using environment variables!
// Example of the RIGHT way:
// module.exports = {
//   API_KEY: process.env.API_KEY,
//   AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
//   AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
//   PORT: process.env.PORT || 3000
// };
