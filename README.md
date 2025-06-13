# Project Proposal: Vibecoding vs The Reflective Coder

### An Empirical Study on AI Interaction Modes in Learning Programming

## 1. Introduction & Problem Statement

Generative AI tools are rapidly being integrated into programming workflows, promising enhanced productivity. However, this integration introduces new interaction paradigms whose effects on learning, cognitive engagement, and skill development are not yet fully understood.

My research done in the Human-Ai interaction module has identified phenomena like **"vibe coding"**—an improvisational, flow-driven style of programming where developers rapidly accept AI suggestions. While efficient, this may lead to shallow engagement and an erosion of foundational problem-solving skills. The same research proposes that introducing **"epistemic friction"**—intentionally slowing down the interaction to encourage thought—could be a valuable pedagogical tool.

This project aims to move beyond qualitative observation and empirically investigate these concepts. We will build and test a prototype learning environment, powered by the **Azure OpenAI API**, to quantitatively measure the differences between an AI that provides direct answers (Vibecoding) and an AI that asks guiding questions (a Reflective model).

## 2. Research Questions & Hypotheses

**Primary Research Question:** How does the interaction modality of an AI assistant (code-generating vs. question-asking) affect a novice programmer's performance, cognitive load, and sense of agency?

**Hypotheses:**

- **H1 (Performance):** The **Vibecoding AI** will lead to faster task completion times, while the **Reflective AI** will result in code that has fewer errors and requires less debugging.
- **H2 (Cognitive Load):** The **Vibecoding AI** will induce a lower cognitive load during initial code generation but may increase it during debugging. The **Refractive AI** will maintain a more consistent, moderate cognitive load.
- **H3 (Agency & Ownership):** Participants using the **Reflective AI** will report a significantly higher sense of ownership over their final code compared to those using the Vibecoding AI.
- **H4 (Learning):** Participants using the **Reflective AI** will be better able to explain the logic of their final code, indicating deeper learning.

## 3. Methodology

To test these hypotheses, we will conduct a controlled experiment using a custom-built, VS Code-inspired web application.

#### 3.1. Experimental Design

The experiment will use a **within-subjects repeated measures design**, controlling for the vast differences in individual programming skill. Each participant will act as their own control by using both AI modalities, allowing us to isolate the effect of the tool itself.

#### 3.2. Tasks

Both experimental tasks will use the Python `turtle` graphics library. The tasks are designed to be comparable in complexity but test slightly different logical steps, making them ideal for a counterbalanced design.

- **Task 1: Draw a Square:** A test of basic loops and geometric understanding.
- **Task 2: Draw a Dashed Line:** A test of more complex loop logic, incorporating state changes (`penup()`/`pendown()`).

#### 3.3. Procedure

Each participant session will be carefully structured to ensure consistency:

1. **Onboarding:** Participants will be briefed, give consent, and receive a short tutorial on the interface and the think-aloud protocol.
2. **Counterbalancing:** The order of tasks and AI modalities will be randomized across participants to prevent order effects.
3. **Task Execution:** Participants will complete both tasks, one in each AI mode, while being screen and audio recorded.
4. **Data Collection:**

   - **Quantitative:** Task completion time, number of run attempts, final code correctness, and AI interaction counts will be logged automatically.
   - **Qualitative:** Standardized surveys (NASA-TLX, SUS) and custom questionnaires on agency will be administered after each task. The screen recordings will provide behavioral data, and a semi-structured debriefing interview will be conducted at the end to understand the reasoning behind participants' actions.

#### 3.4. Data Logging (To be further developed)

All interactions with the system are automatically logged as timestamped JSON events. This includes:

- `session_start`, `task_loaded`, `step_loaded`
- `ai_mode_changed`
- `ai_prompt`, `ai_response`
- `code_applied`, `code_discarded`
- `code_run` (with success/failure status and error messages)

These logs, combined with the screen recordings, will provide a rich, detailed record of the user's entire problem-solving process for later analysis.

## 4. Detailed Project Timeline (7 Weeks + 1 Week Contingency)

This schedule is designed to meet the **August 11th deadline**, incorporating a one-week buffer and your personal availability.

- **Week 1: Finalizing Setup (June 16 - June 22)**
  - **Mon-Wed (Nights):** Focused technical work. Integrate **Azure OpenAI** APIs for the Vibecoding and Reflective modes. Finalize and test the event logging system.
  - **Thurs-Sun (Flexible):** Prepare all experimental materials: digitize surveys (NASA-TLX, SUS), finalize the consent form, and draft the interview script.
- **Week 2: Pilot Study & Recruitment (June 23 - June 29)**
  - **Mon-Wed (Nights):** Conduct 1-2 pilot sessions. This is critical for identifying and fixing bugs in the software and refining the experimental procedure before starting with actual participants.
  - **Thurs-Sun (Flexible):** Begin active participant recruitment (aiming for 8-12 participants). Refine materials based on pilot study feedback and start scheduling sessions.
- **Weeks 3 & 4: Data Collection (June 30 - July 13)**
  - **Mon-Wed (Nights):** Administrative tasks. Organize data from previous sessions (log files, survey results) and prepare for the upcoming sessions.
  - **Thurs-Sun (Flexible):** Prime time for conducting the experiment sessions. Aim to schedule 3-4 participants each weekend.
- **Week 5: Analysis Kick-off (July 14 - July 20)**
  - **Mon-Wed (Nights):** Begin the time-consuming task of transcribing the audio from interviews and think-aloud recordings.
  - **Thurs-Sun (Flexible):** Aggregate all quantitative data into a master spreadsheet and begin running statistical tests (e.g., paired t-tests).
- **Week 6: Deep Data Analysis (July 21 - July 27)**
  - **Mon-Wed (Nights):** Focus on qualitative analysis. Perform thematic coding on interview transcripts to identify key themes and patterns.
  - **Thurs-Sun (Flexible):** Synthesize quantitative and qualitative data, looking for connections between the numbers (e.g., task time) and the user narratives (e.g., feelings of frustration or flow).
- **Week 7: Reporting & Synthesis (July 28 - Aug 3)**
  - **Mon-Wed (Nights):** Draft the 'Methodology' and 'Results' sections of the final report.
  - **Thurs-Sun (Flexible):** Write the 'Introduction', 'Discussion', and 'Conclusion'. Assemble the complete report and create visualizations. **Target completion of the full draft by Aug 3rd.**
- **Week 8: Contingency & Final Review (Aug 4 - Aug 10)**
  - This week is reserved as a buffer for any unexpected delays in data collection or analysis.
  - Final proofreading, formatting, and preparing the project for submission.
- **Submission Deadline: Monday, August 11th**
