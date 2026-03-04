---
sidebar_position: 6
title: Monitoring
description: Monitor QWED performance and health in production
---

# Monitoring QWED in Production

Track QWED's performance, errors, and usage in your production environment.

## Key Metrics to Track

### 1. Verification Success Rate

**What to track:**
- Percentage of successful verifications
- Number of failed verifications
- Failure reasons

**Example logging:**
```python
from datadog import statsd

result = qwed.verify(query)

if result.verified:
    statsd.increment('qwed.verification.success')
else:
    statsd.increment('qwed.verification.failure')
    statsd.increment(f'qwed.failure.{result.reason}')
```

**Target:** >99% success rate

---

### 2. Response Time

**What to track:**
- Average response time
- p50, p95, p99 latency
- Slow queries

```python
import time

start = time.time()
result = qwed.verify(query)
duration = time.time() - start

# Log to monitoring
statsd.timing('qwed.response_time', duration * 1000)  # ms

if duration > 5:  # Slow query threshold
    logger.warning(f"Slow QWED query: {duration}s")
```

**Target:** p95 < 3 seconds

---

### 3. API Quota Usage

**What to track:**
- Daily API calls
- Remaining quota
- Quota usage trend

```python
# After each call
current_quota = client.get_quota_status()

statsd.gauge('qwed.quota.used', current_quota.used)
statsd.gauge('qwed.quota.remaining', current_quota.remaining)

if current_quota.remaining < 1000:
    alert_team("QWED quota low!")
```

---

### 4. Error Rates

**What to track:**
- Network errors
- Timeout errors
- Authentication errors
- Validation errors

```python
from qwed.exceptions import *

try:
    result = qwed.verify(query)
except TimeoutError:
    statsd.increment('qwed.error.timeout')
except AuthenticationError:
    statsd.increment('qwed.error.auth')
    alert_team("QWED auth failure!")
except Exception as e:
    statsd.increment('qwed.error.unknown')
    logger.error(f"QWED error: {e}")
```

**Target:** Error rate < 0.1%

---

## Monitoring Dashboard Example

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "QWED Monitoring",
    "panels": [
      {
        "title": "Verification Success Rate",
        "targets": [
          {
            "expr": "rate(qwed_verification_success_total[5m]) / rate(qwed_verification_total[5m]) * 100"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, qwed_response_time_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(qwed_error_total[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## Alerting Rules

### Critical Alerts

**1. High Error Rate**
```yaml
- alert: QWEDHighErrorRate
  expr: rate(qwed_error_total[5m]) > 0.01
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "QWED error rate above 1%"
    description: "Error rate: {{ $value }}%"
```

**2. Slow Response Time**
```yaml
- alert: QWEDSlowResponses
  expr: histogram_quantile(0.95, qwed_response_time_bucket) > 5
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "QWED p95 latency > 5s"
```

**3. Quota Low**
```yaml
- alert: QWEDQuotaLow
  expr: qwed_quota_remaining < 1000
  for: 1m
  labels:
    severity: warning
  annotations:
    summary: "QWED quota running low"
    description: "Remaining: {{ $value }}"
```

---

## Logging Best Practices

### Structured Logging

```python
import logging
import json

logger = logging.getLogger('qwed')

def verify_with_logging(query, user_id):
    log_data = {
        'timestamp': time.time(),
        'user_id': user_id,
        'query': query[:100],  # Truncate
    }
    
    try:
        start = time.time()
        result = qwed.verify(query)
        duration = time.time() - start
        
        log_data.update({
            'verified': result.verified,
            'duration_ms': int(duration * 1000),
            'status': 'success'
        })
        
        logger.info(json.dumps(log_data))
        return result
        
    except Exception as e:
        log_data.update({
            'status': 'error',
            'error': str(e)
        })
        logger.error(json.dumps(log_data))
        raise
```

---

## Health Checks

### Endpoint Health Check

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health/qwed')
def qwed_health():
    try:
        # Test QWED connection
        result = qwed.verify("2+2=4", timeout=5)
        
        if result.verified:
            return jsonify({
                'status': 'healthy',
                'qwed': 'operational'
            }), 200
        else:
            return jsonify({
                'status': 'degraded',
                'qwed': 'verification_failed'
            }), 503
            
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'qwed': 'error',
            'error': str(e)
        }), 503
```

---

## Troubleshooting Alerts

When alerts fire:

1. **Check dashboard** - Review metrics
2. **Check logs** - Look for errors
3. **Test manually** - Run test script
4. **Contact support** - If issue persists

---

**Next:** [Troubleshooting Guide](./troubleshooting)
