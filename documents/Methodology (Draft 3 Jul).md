
This study investigates how different forms of AI support affect a learner's ability to engage with programming abstraction and style in Python. To achieve this, a mixed-methods experiment was designed to compare a "vibecoding-style" procedural AI with a "reflective" Socratic AI. The design is grounded in established educational theory to provide a robust framework for interpreting the results.

### **Theoretical Framework**

The experiment is framed by a synthesis of three core educational theories to provide a multi-faceted lens for analysis:

1. **Scaffolding Theory (Hammond, 2001):** This theory posits that learning is optimized through temporary, guided support. The two AI assistants are operationalized as distinct scaffolding strategies:
    
    - **Vibecoding AI** provides **procedural scaffolding**, offering immediate, fluent code suggestions with minimal friction.
        
    - **Reflective (Socratic) AI** provides **metacognitive scaffolding**, prompting learners to explain, reflect, and reason about their choices, thereby introducing "epistemic friction."
        
2. **Bloom's Taxonomy (Reinterpreted for AI):** This framework helps classify the cognitive level demanded by each tool.
    
    - **Vibecoding AI** primarily targets the **Apply** level, but risks keeping the user in a passive state.
        
    - **Reflective AI** is designed to push the user through the **Understand → Analyze → Create** levels by encouraging them to own the structure and logic of their solution.
        
3. **Dewey's Educational Philosophy (1938):** This study embraces Dewey's principles by:
    
    - Ensuring all conditions involve **learning by doing**.
        
    - Explicitly testing how the Reflective AI fosters **reflection as a means of growth**.
        
    - Comparing a tool that promotes **inquiry** (Reflective) with one that prioritizes **transmission** (Vibecoding).
        

### **Research Design**

A **within-subjects repeated measures design** was employed. This approach is the most robust method for this study as it controls for the significant confounding variable of individual programming skill. Each participant acts as their own baseline, allowing for a direct measurement of each AI's impact. To mitigate order effects, the sequence of the two AI conditions was counterbalanced across the participant pool.

### **Participants**

[N, e.g., 8-12] participants will be recruited from the university's student population.

### **Apparatus & Tasks**

A custom web application mimicking a modern IDE was developed, powered by the **Azure OpenAI API (GPT-4.1)**.

#### **1. Warm-up Task (Baseline)**

Before the main experiment, all participants will complete a simple warm-up task without any AI assistance: **"Write Python code using a `for` loop to draw a square with the `turtle` library."** The purpose of this task is to ensure all participants are comfortable with the interface and have the same foundational knowledge before proceeding.

#### **2. Main Experimental Task & Tutorial**

The primary task focuses on the conceptual leap from procedural code to **object-oriented abstraction**. The high-level goal, presented to participants in both conditions, is to: **"Modify the provided `Square` class to create a `Rectangle` class that uses `width` and `height` attributes. Implement a `draw()` method and a `scale()` method."**

- **Rationale:** The `Rectangle` class was chosen as the ideal task. It is more abstract than a simple `Square` (requiring management of two distinct properties, `width` and `height`), but less complex than a composite shape, keeping the focus squarely on the core concept of encapsulation. This provides a meaningful challenge where the differences between the two AI scaffolding strategies can be clearly observed.
    
- **Detailed Tutorial Steps (Constant Resource):** In addition to the high-level goal, a detailed, step-by-step tutorial is available to the participant at all times in the left-hand sidebar. This tutorial serves as a constant, optional resource. Its presence allows us to observe a participant's strategy: do they follow the guide, rely on the AI, or ignore both? This choice is a key behavioral metric. The provided steps are:
    
    1. **Define the `__init__` Method:** Modify the class constructor to accept `width` and `height` as arguments. Inside this method, store these values as instance attributes (e.g., `self.width = width`).
        
    2. **Update the `draw()` Method:** Change the drawing logic to use the new `self.width` and `self.height`attributes. The loop will still have four turns, but the `forward()` calls must alternate between the width and height to draw a rectangle.
        
    3. **Implement the `scale()` Method:** Create a `scale()` method that accepts a `factor` as an argument. Inside this method, multiply both `self.width` and `self.height` by the factor.
        
    4. **Test Your Class:** After defining the class, create an instance of your new `Rectangle` class and call its methods to draw it on the screen and test its functionality.
        

### **Procedure**

The session will be screen- and audio-recorded. Each session, lasting approximately **90 minutes**, followed a standardized protocol:

1. **Onboarding (10 mins):** Participants were briefed, signed a consent form, and were instructed on the "think-aloud" protocol.
    
2. **Warm-up Task (5 mins):** Participants completed the "draw a square" task without AI help.
    
3. **Main Task Execution (50 mins):** Each participant completed the `Rectangle` class task twice: once in each AI condition, in a counterbalanced order. 
    
4. **Post-Condition Data Collection (10 mins):** Following _each_ of the two main task conditions, participants completed a Code Comprehension Survey and other standardized questionnaires (NASA-TLX, SUS).
    
5. **Near-Transfer Task & Debriefing (15 mins):** The session concluded with a final surprise task (without AI) and a semi-structured interview.
    
### **Data Collection and Measures**

A mixed-methods approach was used to ensure a rich and triangulated dataset.

#### **Quantitative Measures**

- **Automated Event Logs:** Captured task completion time, number of run attempts, and frequency of AI interaction.
    
- **Standardized Surveys:** The **NASA-TLX** measured cognitive load. The **System Usability Scale (SUS)** measured perceived usability.
    
- **Code Comprehension Survey:** After each condition, participants answered a short quiz about the `Rectangle` class they had just built to provide a quantitative score of their conceptual understanding.
    
- **Near-Transfer Task Performance:** Performance on a surprise `Car` class task was measured as an indicator of learning transfer.
    

#### **Qualitative Measures**

- **Think-Aloud Protocol:** Screen and audio recordings provide direct observational data on problem-solving strategies.
    
- **Code Comprehension Survey (Short Answers):** Written answers to open-ended questions in the comprehension survey provide insight into the user's mental model.
    
- **Semi-Structured Interviews:** The final interview was designed to probe subjective experiences related to agency, code ownership, and the perceived utility of each AI assistant.