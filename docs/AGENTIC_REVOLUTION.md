# Agentic Revolution - A new wave of CLI tools

The target group of attranslate has always been and continues to be "indie hackers" and fast-moving startups.
Hence, attranslate serves to quickly translate products without setting up any complex platforms like weblate.

However, the world is no longer the same as back in the days when the first version of attranslate was released.  
Coding agents like Claude Code or Codex are getting more powerful as we speak, and every decent startup-programmer is using those coding agents. 

As a result, the old way of configuring attranslate no longer makes sense.
After all, when the developer already has an LLM-based coding agent, then it no longer makes sense to configure any external service for attranslate.

That being said, CLI-tools like attranslate are still relevant in the new agentic world.  
In fact, we are seeing a revived interest in CLI-tools because Coding Agents can interact very neatly with CLI-tools.

Therefore, attranslate v2.3.0 is an upgrade to adapt for the new agentic world. 
attranslate v2.3.0 introduces a new flag `--service=agent`, and all other services are considered legacy and only kept for backwards-compat.

The new value-proposition of attranslate is to **reduce token-usage for Coding Agents**, and also to provide an efficient way for verifying the completeness of translations (e.g. in CI/CD-pipelines).
By using attranslate, Coding Agents can either add new translations or verify translation-completeness with only minimal token-usage.

