# Azure Deployment Guide - Visitor Tracker

## 🚀 Deployment Overview

This guide will help you deploy the Visitor Tracker application to Azure using Azure Container Apps.

## 📋 Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure CLI**: Install Azure CLI (see installation steps below)
3. **Azure Developer CLI (AZD)**: Install AZD CLI

## 🛠️ Installation Steps

### 1. Install Azure CLI

**Option A: Using WinGet (Recommended)**
```powershell
winget install -e --id Microsoft.AzureCLI
```

**Option B: Using MSI Installer**
- Download from: https://aka.ms/installazurecliwindowsx64
- Run the installer

**Option C: Using PowerShell Script**
```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindowsx64 -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'
Remove-Item .\AzureCLI.msi
```

**Verify Installation:**
```bash
az --version
```

### 2. Install Azure Developer CLI (AZD)

```powershell
winget install microsoft.azd
```

**Verify Installation:**
```bash
azd version
```

### 3. Login to Azure

```bash
az login
```

This will open a browser window for authentication.

## 🚀 Deployment Steps

### 1. Prepare the Application

The Dockerfiles and azure.yaml have been created for you.

### 2. Initialize AZD (if needed)

```bash
cd F:\Visitor_Tracker
azd init
```

### 3. Deploy to Azure

```bash
azd up
```

This command will:
- Create Azure resources (Container Apps, Container Registry, etc.)
- Build and push Docker images
- Deploy the application
- Provide URLs for your deployed services

### 4. Monitor Deployment

After deployment, you can check the logs:

```bash
azd logs --service backend
azd logs --service frontend
```

## 🔧 Configuration

### Environment Variables

The application uses these environment variables:

**Backend (.env):**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (auto-generated)
- `DB_CONNECTION=sqlite`

**Frontend:**
- `VITE_API_URL` (will be set to backend URL)

## 📊 Architecture

```
Internet
    ↓
[Azure Front Door / CDN] (optional)
    ↓
┌─────────────────┐    ┌─────────────────┐
│ Frontend CA     │    │ Backend CA      │
│ (React + Nginx) │◄──►│ (Laravel + PHP) │
└─────────────────┘    └─────────────────┘
         ↓                       ↓
┌─────────────────┐    ┌─────────────────┐
│ Container       │    │ SQLite DB       │
│ Registry        │    │ (file-based)    │
└─────────────────┘    └─────────────────┘
```

## 🛠️ Troubleshooting

### Common Issues

1. **AZD Command Not Found**
   - Ensure AZD is installed and in PATH
   - Restart PowerShell/Command Prompt

2. **Azure Login Issues**
   - Run `az login` again
   - Check if you have an active Azure subscription

3. **Deployment Failures**
   - Check logs: `azd logs --service <service-name>`
   - Verify Dockerfiles are correct
   - Ensure ports are properly configured

### Useful Commands

```bash
# Check deployment status
azd show

# View environment details
azd env list

# Clean up resources
azd down
```

## 📝 Post-Deployment

1. **Update Frontend API URL**: The frontend needs to know the backend URL
2. **Configure Domain**: Set up custom domain if needed
3. **SSL Certificates**: Azure provides automatic HTTPS
4. **Monitoring**: Check Application Insights for metrics

## 💰 Cost Estimation

- **Azure Container Apps**: Pay-per-use (very low for light traffic)
- **Container Registry**: Small storage cost
- **Application Insights**: Free tier available

## 🔒 Security Notes

- User-managed identities are configured for secure access
- Container images are stored securely in Azure Container Registry
- HTTPS is enabled by default

---

**Need Help?** Check the Azure documentation or run `azd --help` for more commands.