/**
 * Unified Agent Execution Flow - Phase Prompts
 * 
 * Prompt templates for each phase of the unified 6-step execution flow.
 */

/**
 * Phase 1: Task Parsing Prompt
 * 
 * Guides the agent to:
 * 1. Classify the task type
 * 2. Gather context in parallel
 * 3. Extract success criteria
 * 4. Consult Metis if needed
 */
export const PHASE_1_TASK_PARSING_PROMPT = `
## 🎯 PHASE 1: TASK PARSING

You are in the **TASK PARSING** phase of the unified execution flow.

### Your Mission
Parse the user's request to understand:
1. **Task Type**: What kind of task is this?
2. **Context**: What information do we need?
3. **Success Criteria**: How do we know it's done?

### Step 1: Classify Task Type

Analyze the user's request and classify it into one of these types:

| Type | Signals | Examples |
|------|---------|----------|
| **run_demo** | "运行", "启动", "run", "start", "demo" | "帮我将当前的项目demo运行起来" |
| **fix_bug** | "修复", "bug", "fix", "错误" | "修复登录功能中的空指针异常" |
| **add_feature** | "添加", "实现", "add", "implement" | "添加用户头像上传功能" |
| **refactor** | "重构", "优化", "refactor", "optimize" | "重构整个项目的TypeScript代码" |
| **other** | Other requests | - |

**Output**: "Task Type: [type]"

### Step 2: Gather Context (PARALLEL - Launch Immediately)

Launch these agents in **parallel** using \`background_task\`:

\`\`\`typescript
// Launch 3-5 parallel exploration tasks
background_task(agent="explore", prompt="Find project structure: package.json, startup scripts, main entry points...")
background_task(agent="explore", prompt="Find dependencies: package.json dependencies, requirements.txt, etc...")
background_task(agent="explore", prompt="Find configuration files: .env, config files, docker-compose.yml...")
background_task(agent="librarian", prompt="Find project documentation: README.md, docs, setup instructions...")
\`\`\`

**CRITICAL**: Launch ALL of these in ONE message. Don't wait for results.

### Step 3: Consult Metis (if task is complex)

For complex or ambiguous tasks, consult Metis agent:

\`\`\`typescript
call_omo_agent(
  subagent_type="Metis (Plan Consultant)",
  prompt="Analyze this task: [user's request]. Identify hidden requirements, ambiguities, and potential risks."
)
\`\`\`

**When to consult Metis**:
- Task is ambiguous or open-ended
- Multiple interpretations possible
- Complex requirements
- Need to clarify scope

### Step 4: Extract Success Criteria

Define **clear, verifiable** success criteria. Format:

\`\`\`markdown
Success Criteria:
- Type: [run_demo|fix_bug|add_feature|refactor]
- Description: [human-readable description]
- Verification:
  - Method: [http_check|test_run|port_check|manual_check]
  - Target: [URL, command, file path, etc.]
  - Expected: [expected result]
\`\`\`

**Examples**:

**run_demo**:
\`\`\`
Success Criteria:
- Type: run_demo
- Description: Demo service runs successfully
- Verification:
  - Method: http_check
  - Target: http://localhost:3000
  - Expected: 200 OK
\`\`\`

**fix_bug**:
\`\`\`
Success Criteria:
- Type: fix_bug
- Description: Bug no longer occurs
- Verification:
  - Method: test_run
  - Target: npm test -- bug-scenario.test.ts
  - Expected: All tests pass
\`\`\`

**add_feature**:
\`\`\`
Success Criteria:
- Type: add_feature
- Description: Feature works as specified
- Verification:
  - Method: manual_check
  - Target: [specific behavior to test]
  - Expected: [expected behavior]
\`\`\`

### Step 5: Handle User Interaction (if needed)

**If you encounter commands that require user input** (e.g., sudo password, confirmation):

1. **Detect the need for user input**:
   - Command output contains "sudo: a password is required"
   - Command asks for confirmation
   - Command requires interactive input

2. **Use the user_interaction tool**:
   \`\`\`typescript
   user_interaction(
     type="password",  // or "confirm", "text", "select"
     message="This command requires sudo privileges. Please enter your password.",
     description="The following command needs sudo access: [command]"
   )
   \`\`\`

3. **Wait for user response**:
   - Execution will pause automatically
   - User will see the prompt in TUI
   - After user provides input, execution continues

**Important**: Always explain why you need the input and what it will be used for.

### Step 6: Output Phase 1 Summary

After completing Phase 1, output:

\`\`\`markdown
✅ PHASE 1 COMPLETE: TASK PARSING

Task Type: [type]
Success Criteria: [criteria summary]
Context Gathered: [summary of what was found]

Proceeding to Phase 2: Intelligent Decomposition...
\`\`\`

### Important Notes

- **Don't start implementing yet** - Phase 1 is only about understanding
- **Launch context gathering in parallel** - Don't wait sequentially
- **Be specific about success criteria** - Vague criteria lead to failure
- **Consult Metis for complex tasks** - It helps prevent AI slop
- **Handle user input gracefully** - Use user_interaction tool when needed
`

/**
 * Phase 2: Intelligent Decomposition Prompt
 * 
 * Guides the agent to:
 * 1. Create a detailed work plan
 * 2. Review the plan with Momus
 * 3. Iterate if needed
 */
export const PHASE_2_INTELLIGENT_DECOMPOSITION_PROMPT = `
## 📋 PHASE 2: INTELLIGENT DECOMPOSITION

You are in the **INTELLIGENT DECOMPOSITION** phase of the unified execution flow.

### Your Mission
Create a detailed, reviewable work plan that can be executed in Phase 3.

### Step 1: Create Work Plan

Use the **plan** agent (or Prometheus for complex tasks) to create a detailed plan:

\`\`\`typescript
// For simple tasks
call_omo_agent(
  subagent_type="plan",
  prompt="Create a detailed work plan for: [task description]. Success criteria: [success criteria]. Save to .sisyphus/plans/[task-name].md"
)

// For complex tasks
call_omo_agent(
  subagent_type="Prometheus (Planner)",
  prompt="Create a comprehensive work plan for: [task description]. Success criteria: [success criteria]. Save to .sisyphus/plans/[task-name].md"
)
\`\`\`

**Plan Requirements**:
- Must be saved to \`.sisyphus/plans/[task-name].md\`
- Must include all tasks broken down into executable steps
- Each task must have clear verification criteria
- Must include task dependencies
- Must reference existing code patterns when applicable

### Step 2: Review Plan with Momus

After the plan is created, **MANDATORY**: Review it with Momus agent:

\`\`\`typescript
call_omo_agent(
  subagent_type="Momus (Plan Reviewer)",
  prompt="Review the work plan at .sisyphus/plans/[task-name].md. Check for clarity, verifiability, and completeness."
)
\`\`\`

### Step 3: Handle Review Result

**If Momus says OKAY**:
- Proceed to Phase 3
- Use the approved plan

**If Momus says REJECT**:
- Read Momus's feedback carefully
- Refine the plan based on feedback
- Re-submit to Momus
- **Maximum 3 iterations** - If still rejected after 3 attempts, report to user

### Step 4: Output Phase 2 Summary

After plan is approved, output:

\`\`\`markdown
✅ PHASE 2 COMPLETE: INTELLIGENT DECOMPOSITION

Plan Created: .sisyphus/plans/[task-name].md
Plan Status: ✅ Approved by Momus
Total Tasks: [N]
Tasks Breakdown:
- [Task 1]: [description]
- [Task 2]: [description]
...

Proceeding to Phase 3: Parallel Execution...
\`\`\`

### Important Notes

- **Always review with Momus** - Don't skip this step
- **Plan must be detailed** - Vague plans lead to failure
- **Iterate if rejected** - But don't loop forever
- **Save plan to correct location** - .sisyphus/plans/
`

/**
 * Phase 3-6 prompts (placeholders for now)
 */
export const PHASE_3_PARALLEL_EXECUTION_PROMPT = `
## ⚡ PHASE 3: PARALLEL EXECUTION

[To be implemented in Phase 2 of development]
`

export const PHASE_4_SYNTHESIS_CONSTRUCTION_PROMPT = `
## 🔨 PHASE 4: SYNTHESIS & CONSTRUCTION

[To be implemented in Phase 2 of development]
`

export const PHASE_5_QUALITY_ASSURANCE_PROMPT = `
## ✅ PHASE 5: QUALITY ASSURANCE

You are in the **QUALITY ASSURANCE** phase of the unified execution flow.

### Your Mission
Verify that the task is truly complete, not just code quality checks.

### Step 1: Code Quality Check

Run standard code quality checks:

\`\`\`typescript
// Check for linting errors
lsp_diagnostics()

// Run tests if available
bash("npm test")
\`\`\`

### Step 2: End-to-End Verification (MANDATORY)

**CRITICAL**: Task is NOT complete until end-to-end verification passes.

Call the verification tool to verify task completion. You should use the success criteria extracted in Phase 1:

\`\`\`typescript
// Get success criteria from Phase 1 output or state
// Example for run_demo task:
verification(
  taskType="run_demo",
  taskDescription="[your task description]",
  successCriteria={
    type: "run_demo",
    description: "Demo service runs successfully",
    verification: {
      method: "http_check",  // or "port_check", "test_run", etc.
      target: "http://localhost:3000",  // or port number, command, etc.
      expected: "200 OK",  // expected result
      timeout: 30000  // optional timeout in milliseconds
    }
  }
)
\`\`\`

**Note**: Replace the values above with the actual success criteria from Phase 1.

**Verification Requirements**:
- ✅ Verification must return SUCCESS
- ✅ All evidence must be collected
- ✅ If verification fails, fix issues and retry

### Step 3: Output Phase 5 Summary

After verification passes, output:

\`\`\`markdown
✅ PHASE 5 COMPLETE: QUALITY ASSURANCE

Code Quality: ✅ Pass
End-to-End Verification: ✅ Pass
Evidence Collected: [N] items

Proceeding to Phase 6: Result Delivery...
\`\`\`

### Important Notes

- **Don't skip verification** - It's mandatory
- **Fix issues if verification fails** - Don't proceed until it passes
- **Collect evidence** - Screenshots, logs, test results
`

export const PHASE_6_RESULT_DELIVERY_PROMPT = `
## 📦 PHASE 6: RESULT DELIVERY

[To be implemented in Phase 2 of development]
`

/**
 * Get prompt for a specific phase
 */
export function getPhasePrompt(phase: string): string {
  switch (phase) {
    case "task_parsing":
      return PHASE_1_TASK_PARSING_PROMPT
    case "intelligent_decomposition":
      return PHASE_2_INTELLIGENT_DECOMPOSITION_PROMPT
    case "parallel_execution":
      return PHASE_3_PARALLEL_EXECUTION_PROMPT
    case "synthesis_construction":
      return PHASE_4_SYNTHESIS_CONSTRUCTION_PROMPT
    case "quality_assurance":
      return PHASE_5_QUALITY_ASSURANCE_PROMPT
    case "result_delivery":
      return PHASE_6_RESULT_DELIVERY_PROMPT
    default:
      return ""
  }
}

