---
sidebar_position: 1
title: Getting Started
description: Quick start guide for integrating QWED into your application
---

# Getting Started with QWED

Learn how to set up and run QWED in your development environment.

:::danger Common Mistake
**Don't call your LLM directly!** QWED needs to run as a backend server with YOUR LLM API keys configured in environment variables. See [Common Pitfalls](./common-pitfalls) for details.
:::

---

## Architecture Overview

QWED uses a **backend server model**:

```
Your Application
  ↓ (SDK calls)
QWED Backend Server (you run this!)
  ├─ Your LLM API Key (from .env)
  ├─ LLM calls (OpenAI/Anthropic/etc)
  ├─ Formal Verifiers (SymPy, Z3)
  └─ Returns verified result
```

---

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/QWED-AI/qwed-verification.git
cd qwed-verification

# Install Python dependencies
pip install -r requirements.txt
```

---

## Step 2: Configure LLM Provider

QWED is **model agnostic** - choose any LLM based on your needs:

### Create Environment File

```bash
# Copy example configuration
cp .env.example .env
```

### Choose Your LLM Provider

Edit `.env` and add your API key for ONE provider:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="openai" label="OpenAI" default>

```bash
# .env
ACTIVE_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
```

**Get API Key:** https://platform.openai.com/api-keys

  </TabItem>
  <TabItem value="anthropic" label="Anthropic Claude">

```bash
# .env
ACTIVE_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Get API Key:** https://console.anthropic.com

  </TabItem>
  <TabItem value="azure" label="Azure OpenAI">

```bash
# .env
ACTIVE_PROVIDER=azure_openai
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=gpt-4
AZURE_OPENAI_API_VERSION=2024-02-01
```

**Get Credentials:** https://portal.azure.com → Azure OpenAI Service

  </TabItem>
  <TabItem value="gemini" label="Google Gemini">

```bash
# .env
ACTIVE_PROVIDER=gemini
GOOGLE_API_KEY=AIzaSy...
```

**Get API Key:** https://makersuite.google.com/app/apikey

  </TabItem>
</Tabs>

:::tip See Full Configuration Guide
For AWS Bedrock and more options, see: [LLM Configuration](https://github.com/QWED-AI/qwed-verification/blob/main/docs/LLM_CONFIGURATION.md)
:::

---

## Step 3: Run QWED Backend Server

```bash
# Start the backend server
python -m qwed_api

# You should see:
# INFO: Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal running!** The server needs to stay active.

---

## Step 4: Install SDK

In a **new terminal**, install the QWED SDK in your project:

<Tabs groupId="language">
  <TabItem value="python" label="Python" default>

```bash
pip install qwed
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```bash
npm install @qwed-ai/sdk
```

  </TabItem>
  <TabItem value="go" label="Go">

```bash
go get github.com/qwed-ai/qwed-go
```

  </TabItem>
</Tabs>

---

## Step 5: Use the SDK

Connect your application to the local QWED backend:

<Tabs groupId="language">
  <TabItem value="python" label="Python" default>

```python
from qwed import QWEDClient

# Connect to local backend
client = QWEDClient(
    api_key="qwed_local",  # Local auth key
    base_url="http://localhost:8000"
)

# Verify a mathematical claim
result = client.verify("Is 2+2 equal to 4?")

print(result.verified)  # True
print(result.evidence)  # {"calculated": 4, "claimed": 4}
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
import { QWEDClient } from '@qwed-ai/sdk';

// Connect to local backend
const client = new QWEDClient({
  apiKey: 'qwed_local',
  baseUrl: 'http://localhost:8000'
});

// Verify a mathematical claim
const result = await client.verify('Is 2+2 equal to 4?');

console.log(result.verified);  // true
console.log(result.evidence);  // {calculated: 4, claimed: 4}
```

  </TabItem>
  <TabItem value="go" label="Go">

```go
package main

import (
    "context"
    "fmt"
    "github.com/qwed-ai/qwed-go"
)

func main() {
    client := qwed.NewClient("qwed_local", "http://localhost:8000")
    
    result, err := client.Verify(context.Background(), "Is 2+2 equal to 4?")
    if err != nil {
        panic(err)
    }
    
    fmt.Println(result.Verified)  // true
}
```

  </TabItem>
</Tabs>

---

## Verify Installation

Run this test to ensure everything is working:

<Tabs groupId="language">
  <TabItem value="python" label="Python" default>

```python
from qwed import QWEDClient

client = QWEDClient(
    api_key="qwed_local",
    base_url="http://localhost:8000"
)

# Test 1: Math verification
assert client.verify("2+2=4").verified == True
print("✅ Math verification works!")

# Test 2: Error detection
assert client.verify("2+2=5").verified == False
print("✅ Error detection works!")

# Test 3: Code security
result = client.verify_code("eval(user_input)", language="python")
assert result.blocked == True
print("✅ Security detection works!")

print("\n🎉 QWED is working correctly!")
```

  </TabItem>
  <TabItem value="typescript" label="TypeScript">

```typescript
import { QWEDClient } from '@qwed-ai/sdk';

const client = new QWEDClient({
  apiKey: 'qwed_local',
  baseUrl: 'http://localhost:8000'
});

async function testIntegration() {
  // Test 1: Math verification
  const result1 = await client.verify('2+2=4');
  console.assert(result1.verified === true);
  console.log('✅ Math verification works!');

  // Test 2: Error detection  
  const result2 = await client.verify('2+2=5');
  console.assert(result2.verified === false);
  console.log('✅ Error detection works!');

  // Test 3: Code security
  const result3 = await client.verifyCode('eval(user_input)', { language: 'python' });
  console.assert(result3.blocked === true);
  console.log('✅ Security detection works!');

  console.log('\n🎉 QWED is working correctly!');
}

testIntegration();
```

  </TabItem>
</Tabs>

---

## Next Steps

Once your integration is working:

- 📖 [Common Pitfalls](./common-pitfalls) - Avoid integration mistakes
- 🧪 [Testing Your Integration](./testing) - Validate your setup
- 🚀 [Production Deployment](./production) - Deploy with confidence

---

## Troubleshooting

### Backend won't start

**Problem:**
```
Error: ANTHROPIC_API_KEY environment variable not set
```

**Solution:**
Check your `.env` file has the correct API key for your chosen provider.

---

### SDK can't connect

**Problem:**
```
Connection refused to http://localhost:8000
```

**Solution:**
1. Make sure backend is running (`python -m qwed_api`)
2. Check backend terminal for errors
3. Verify port 8000 is not blocked

---

### Wrong results

**Problem:**
Verification results are incorrect or unexpected.

**Solution:**
1. Check which LLM provider you configured
2. Verify your API key is valid
3. See [Testing Guide](./testing) for detailed diagnostics

---

## Need Help?

- 💬 [Community Support](https://github.com/QWED-AI/qwed-verification/discussions)
- 📧 Email: support@qwedai.com
- 📖 [Full Documentation](https://docs.qwedai.com)
