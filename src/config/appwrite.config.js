// ============================================
// CONFIGURAÇÃO DO APPWRITE
// ============================================
// Ajuste esses valores de acordo com seu ambiente

export const APPWRITE_CONFIG = {
    // URL base da API do Appwrite
    BASE_URL: 'http://localhost:9090/v1',
    
    // ID do projeto (encontre em Settings → General)
    PROJECT_ID: '693cc982001c2bf6c9ab',
    
    // API Key (crie em Settings → API Keys)
    API_KEY: 'standard_9c4c074b60e91c48a2ae0850fd8a91f16adcc8cffbc538947cd8ff75242948f2f39da0391b0c86274b0ad46a68b7b0d931d15e24a50178b6d019f3c7a675c368852adc70e7568a8eca2ec935535bdf6f9fb2319cfaa8fb9a610b740cd9508a47193170463e66fb2ab6738b19a7aa48370f1983968cb53ea8ef33f3d653701d46',
    
    // IDs dos recursos
    DATABASE_ID: '693ccaca0031917bf35b',
    COLLECTION_ID: '693ccad40017cbe94715',
    BUCKET_ID: '693d91c200026a7232e3',
};

// ============================================
// CONFIGURAÇÃO DO APP MOBILE
// ============================================
export const APP_CONFIG = {
    VERSION: '2.5.0',
    BUILD: '250',
    NAME: 'MeuAppMobile',
};

// ============================================
// DISPOSITIVOS MÓVEIS SIMULADOS
// ============================================
export const MOBILE_DEVICES = [
    { 
        platform: 'iOS', 
        device: 'iPhone 15 Pro', 
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 
        osVersion: '17.1', 
        screenWidth: 393, 
        screenHeight: 852 
    },
    { 
        platform: 'iOS', 
        device: 'iPhone 14', 
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 
        osVersion: '16.6', 
        screenWidth: 390, 
        screenHeight: 844 
    },
    { 
        platform: 'iOS', 
        device: 'iPad Pro 12.9', 
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148', 
        osVersion: '17.0', 
        screenWidth: 1024, 
        screenHeight: 1366 
    },
    { 
        platform: 'Android', 
        device: 'Samsung Galaxy S24', 
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36', 
        osVersion: '14', 
        screenWidth: 412, 
        screenHeight: 915 
    },
    { 
        platform: 'Android', 
        device: 'Google Pixel 8 Pro', 
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36', 
        osVersion: '14', 
        screenWidth: 412, 
        screenHeight: 892 
    },
    { 
        platform: 'Android', 
        device: 'Xiaomi 14', 
        userAgent: 'Mozilla/5.0 (Linux; Android 14; 2401DPM57C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.66 Mobile Safari/537.36', 
        osVersion: '14', 
        screenWidth: 393, 
        screenHeight: 873 
    },
];

// ============================================
// CONDIÇÕES DE REDE
// ============================================
export const NETWORK_CONDITIONS = [
    { type: '5G', quality: 'excellent', thinkTimeMultiplier: 1.0 },
    { type: '4G/LTE', quality: 'good', thinkTimeMultiplier: 1.2 },
    { type: '4G', quality: 'fair', thinkTimeMultiplier: 1.5 },
    { type: '3G', quality: 'poor', thinkTimeMultiplier: 2.5 },
    { type: 'WiFi', quality: 'excellent', thinkTimeMultiplier: 0.8 },
];

// Pesos para distribuição de redes (deve somar 1.0)
export const NETWORK_WEIGHTS = [0.15, 0.30, 0.20, 0.05, 0.30];

// ============================================
// LOCALES SUPORTADOS
// ============================================
export const LOCALES = ['pt-BR', 'pt-PT', 'en-US', 'es-ES'];

