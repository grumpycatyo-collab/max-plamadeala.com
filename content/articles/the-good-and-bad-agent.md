---
title: "The good and the bad agent"
publishDate: 2026-07-27
description: "How to effectively review PR's in the AI era"
slug: "the-good-and-bad"
featured: true
---

It’s probably not news to any of us that agents now do a lot of coding work, including reviewing PRs. 
For a long time, this has been a bit of a bummer for me. An agent reviewing your PR—Cursor BugBot, a custom Cursor reviewer, or something similar—can suddenly bloat the entire PR with comments.
Sometimes, if you’re lucky, you get no more than ten comments. On its worst days, however, it might leave 150 comments of pure hatred toward you and your code.
Good comments and thoughtful reviews are really important to me. I’m not a huge fan of agent reviews because, in my opinion, there is a limit to how good they can be.

If an agent leaves 20 comments, fair enough—I’ll take a look. If it leaves 50, that sounds a little strange, but sure, I’ll skim through them.
But if it leaves more than 70 or 80? No. Absolutely not.

There is also the problem of agent drift. The more comments and context the reviewer has to process, the more likely it is to drift. The same thing can happen to the model you ask to resolve those comments.

To combat this cycle of agony, I decided to fight on equal terms and create my own thing.
On my local machine, it is called `acceptance-supervised-resolve`, but you can call it Ted. Or Rick.

## How it works

The flow is simple.

There are three agents involved:

- **The orchestrator:** the parent agent running the skill and coordinating the process
- **The resolver:** a coding agent—`composer-2.5-fast` by default—that fixes the issues raised in the comments
- **The supervisor:** a stronger model that does not write code, but reviews the resolver’s work. It can skip comments, defer them, or ignore them when they are irrelevant

First, the orchestrator creates an `acceptance-<branch>` branch from the current tip of your working branch.

Why?

Because we need to freeze the original version of the branch before the resolver starts making changes. Your current branch remains the working branch, while the acceptance branch becomes the untouched source of truth.

![Diagram showing the ACCEPTANCE branch frozen at its tip as the source of truth, while the WORK branch progresses through fix1, fix2, and further fixes to a supervisor-approved tip](/article-images/acceptance-work-flow.png)

The supervisor then looks through the GitHub review comments and classifies each one:

| Verdict | Meaning |
|---------|---------|
| `FIX` | Valid, within the purpose of WORK compared with ACCEPTANCE, and requires a minimal code change |
| `SKIP` | Noise, style-only, outdated, or would expand the scope beyond the original intent |
| `ASK` | Ambiguous—surface it to the user before the resolver runs |

The important part is that the goal is not to make the bot happy.

The goal is to preserve the original purpose of the branch while fixing legitimate issues.

Once the comments have been classified, the resolver starts working through the `FIX` items.

After the resolver finishes, the supervisor runs again. It compares the updated working branch against the frozen acceptance branch, checks whether the resolver drifted from the original purpose, and reviews the resulting code.

If the supervisor rejects the changes, they go back to the resolver for another attempt.

The loop continues until everything is good and crispy.

After that, your PR should be clean and smooth like butter. Also here is the link to the skill:
[github.com/grumpycatyo-collab/skills](https://github.com/grumpycatyo-collab/skills)

Thanks!