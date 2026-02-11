# CASL Authorization Implementation

This implementation provides a complete CASL (Code Access Security Library) authorization system with MongoDB storage for policies.

## Features

- ✅ Role-based policies
- ✅ User-specific policies (allow and deny)
- ✅ User policies override role policies
- ✅ Field-level permissions support
- ✅ Conditional permissions
- ✅ MongoDB storage
- ✅ Easy-to-use decorators
- ✅ Auto-discovery of policies from controllers
- ✅ @CheckAbilities decorator detection

## Architecture

### Policy Schema

Policies are stored in MongoDB with the following structure:

```typescript
{
  action: string;       // 'create', 'read', 'update', 'delete', 'manage'
  subject: string;      // Resource name (e.g., 'Chat', 'Project', 'User')
  fields?: string[];    // Optional: specific fields the policy applies to
  conditions?: any;     // Optional: MongoDB query conditions
  inverted?: boolean;   // Optional: true for "cannot" rules
  reason?: string;      // Optional: description of why this policy exists
}
```

### Role Policies

Roles have an array of policy ObjectIds that apply to all users with that role.

### User Policies

Users have two arrays of policies:
- `allow`: Additional permissions granted to the user
- `deny`: Permissions explicitly denied to the user

**Priority Order:**
1. User deny policies (highest priority)
2. User allow policies
3. Role policies (lowest priority)

## Usage Examples

### 1. Create Policies

```bash
# Create a policy for reading chats
POST /api/policy
Content-Type: application/json

{
  "action": "read",
  "subject": "Chat"
}

# Create a policy for creating projects
POST /api/policy
Content-Type: application/json

{
  "action": "create",
  "subject": "Project"
}

# Create a conditional policy (can only update own projects)
POST /api/policy
Content-Type: application/json

{
  "action": "update",
  "subject": "Project",
  "conditions": { "created_by": "{{ userId }}" }
}

# Create a field-level policy (can only read specific fields)
POST /api/policy
Content-Type: application/json

{
  "action": "read",
  "subject": "User",
  "fields": ["email", "full_name"]
}
```

### 2. Assign Policies to Roles

```bash
# Add policies to a role
POST /api/role/:roleId/policies
Content-Type: application/json

{
  "policies": [
    {
      "action": "read",
      "subject": "Chat"
    },
    {
      "action": "create",
      "subject": "Chat"
    }
  ]
}

# Remove policies from a role
DELETE /api/role/:roleId/policies
Content-Type: application/json

{
  "policies": [
    {
      "action": "delete",
      "subject": "Chat"
    }
  ]
}
```

### 3. Assign Policies to Users

```bash
# Add allow and deny policies to a user
POST /api/policy/user/:userId
Content-Type: application/json

{
  "allow": [
    {
      "action": "manage",
      "subject": "Project"
    }
  ],
  "deny": [
    {
      "action": "delete",
      "subject": "Chat"
    }
  ]
}
```

### 4. Using the Decorators

#### In Controllers

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CaslGuard } from 'src/casl/casl.guard';
import { CheckAbilities } from 'src/casl/casl.decorator';
import { Action } from 'src/casl/casl-ability.factory';

@Controller('example')
@UseGuards(AuthGuard('jwt'), CaslGuard)
export class ExampleController {
  // Single permission check
  @Get()
  @CheckAbilities({ action: Action.Read, subject: 'Example' })
  findAll() {
    return [];
  }

  // Multiple permission checks
  @Post()
  @CheckAbilities(
    { action: Action.Create, subject: 'Example' },
    { action: Action.Read, subject: 'Example' }
  )
  create() {
    return {};
  }

  // Using helper decorators
  @Get(':id')
  @CheckAbilities({ action: Action.Read, subject: 'Example' })
  findOne() {
    return {};
  }
}
```

#### Available Actions

```typescript
enum Action {
    Manage = 'manage',  // Can do anything
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete',
}
```

## How It Works

### 1. Policy Resolution

When a user is authenticated, their policies are loaded:

```typescript
{
  active_role: {
    policies: [/* role policies */]
  },
  policies: {
    allow: [/* user allow policies */],
    deny: [/* user deny policies */]
  }
}
```

### 2. Ability Building

The `CaslAbilityFactory` builds CASL abilities in this order:

1. Apply role policies
2. Apply user allow policies (can override role)
3. Apply user deny policies (cannot be overridden)

### 3. Permission Check

The `CaslGuard` checks if the user has the required permissions:

```typescript
const ability = caslAbilityFactory.createForUser(user);
const canRead = ability.can(Action.Read, 'Chat');
```

## Common Patterns

### Admin Access

```typescript
{
  "action": "manage",
  "subject": "all"
}
```

### Resource Owner Pattern

```typescript
{
  "action": "update",
  "subject": "Project",
  "conditions": { "created_by": "{{ userId }}" }
}
```

### Deny All Deletes

```typescript
{
  "action": "delete",
  "subject": "all",
  "inverted": true  // This makes it a "cannot" rule
}
```

## Testing

The chat controller has been configured with CASL decorators for testing:

```bash
# These routes now check permissions
GET    /api/chat           → requires: read Chat
POST   /api/chat           → requires: create Chat
GET    /api/chat/:id       → requires: read Chat
PATCH  /api/chat/:id       → requires: update Chat
DELETE /api/chat/:id       → requires: delete Chat
```

## Example Scenarios

### Scenario 1: User can read but not delete chats

**Role Policies:**
```json
[
  { "action": "read", "subject": "Chat" },
  { "action": "create", "subject": "Chat" },
  { "action": "delete", "subject": "Chat" }
]
```

**User Deny Policies:**
```json
[
  { "action": "delete", "subject": "Chat" }
]
```

**Result:** User can read and create chats, but cannot delete them (deny overrides role).

### Scenario 2: User gets extra permission

**Role Policies:**
```json
[
  { "action": "read", "subject": "Project" }
]
```

**User Allow Policies:**
```json
[
  { "action": "create", "subject": "Project" },
  { "action": "update", "subject": "Project" }
]
```

**Result:** User can read (from role), create, and update projects.

## Auto-Discovery System

The system automatically discovers policies from your controllers on application startup.

### How It Works

1. **On Startup**: The PolicyModule scans all controllers and their routes
2. **Decorator Detection**: Prioritizes `@CheckAbilities` decorators for explicit permissions
3. **HTTP Method Fallback**: Infers permissions from HTTP methods (GET → read, POST → create, etc.)
4. **Smart Seeding**: Only seeds policies if the database is empty (won't overwrite custom policies)
5. **Subject Naming**: Converts controller paths to PascalCase subjects (e.g., `/chat` → `Chat`)

### Discovery Rules

```typescript
// If @CheckAbilities decorator exists, use it:
@Get()
@CheckAbilities({ action: Action.Read, subject: 'Chat' })
findAll() {}
// Discovers: { action: 'read', subject: 'Chat' }

// Otherwise, infer from HTTP method and controller path:
@Get()  // in ChatController
findAll() {}
// Discovers: { action: 'read', subject: 'Chat' }

// Multiple permissions from one decorator:
@Post()
@CheckAbilities(
  { action: Action.Create, subject: 'Chat' },
  { action: Action.Read, subject: 'User' }
)
create() {}
// Discovers both permissions
```

### Manual Rediscovery

Trigger policy rediscovery without restarting:

```bash
POST /api/policy/rediscover

# Response:
{
  "discovered": 5,  // New policies found and added
  "existing": 20    // Policies already in database
}
```

### Discovered Policy Format

Auto-discovered policies are created with:
```typescript
{
  action: 'read' | 'create' | 'update' | 'delete',
  subject: 'Chat' | 'User' | 'Project' | ...,
  inverted: false,
  reason: 'Auto-discovered from {Subject} controller'
}
```

You can then manually edit these policies to add:
- `fields`: Field-level restrictions
- `conditions`: MongoDB query conditions
- `inverted`: Change to "cannot" rule
- `reason`: Update the description

## API Endpoints

### Policy Management
- `GET /api/policy` - List all policies
- `GET /api/policy/:id` - Get a specific policy
- `POST /api/policy` - Create a new policy
- `POST /api/policy/rediscover` - Rediscover and seed new policies from controllers
- `PATCH /api/policy/:id` - Update a policy
- `DELETE /api/policy/:id` - Delete a policy

### User Policy Management
- `POST /api/policy/user/:userId` - Add policies to a user
- `DELETE /api/policy/user/:userId` - Remove policies from a user

### Role Policy Management
- `POST /api/role/:roleId/policies` - Add policies to a role
- `DELETE /api/role/:roleId/policies` - Remove policies from a role
