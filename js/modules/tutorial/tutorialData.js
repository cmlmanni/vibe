/* filepath: /js/modules/tutorial/tutorialData.js */
export const tutorialTasks = [
  {
    title: "Foundation: Understanding Turtle Graphics",
    description:
      "Learn the basics by seeing how turtle graphics works, then practice independently.",
    type: "foundation",
    aiAllowed: false,
    completed: false,
    estimatedTime: "8-10 minutes",
    conceptIntroduction: `Turtle graphics is a drawing system where you control a virtual "turtle" that moves around the screen, drawing lines as it goes. Originally created in 1966 to teach programming to children, it remains one of the best ways to learn coding because you can immediately see the results of your commands.

Think of the turtle as holding a pen - it starts at the center of the screen (position 0,0) facing right. You give it simple commands like "move forward 50 steps" or "turn right 90 degrees" and it draws as it moves.`,
    concepts: [
      "Turtle graphics",
      "Basic drawing commands",
      "Code refactoring",
      "Sequential execution",
    ],
    steps: [
      {
        instruction:
          "Study this Python turtle graphics example that draws a square with sides of length 50.",
        code: `import turtle
t = turtle.Turtle()
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)
t.forward(50)
t.right(90)`,
        hint: "This code demonstrates sequential execution - each line runs one after another. Notice the pattern: forward 50, turn right 90 degrees, repeated 4 times.",
        tip: "Understanding this foundation will help you with all future tasks. The repetitive nature of this code (doing the same thing 4 times) is something we'll improve later using loops and functions.",
        learningNote:
          "This is called 'procedural programming' - giving the computer a step-by-step list of instructions. Each command executes in order, and the turtle 'remembers' its position and direction between commands.",
        type: "demonstration",
        conceptConnection:
          "This introduces the basic building blocks: import (getting tools), creating objects (turtle.Turtle()), and method calls (forward, right).",
      },
      {
        instruction:
          "Now it's your turn! Write Python code using turtle graphics to draw an equilateral triangle with sides of length 50. Work independently without AI assistance - this helps build your foundational understanding.",
        code: "# Try drawing a triangle using turtle commands\n# Remember: import turtle, create a turtle, then give it movement commands\n# Hint: A triangle has 3 sides and each turn is 120 degrees",
        hint: "A triangle has 3 sides. Each exterior angle (the turn) should be 120 degrees (360° ÷ 3 sides = 120°).",
        tip: "Follow the same pattern as the square: forward, turn, forward, turn, forward, turn. But this time you only need 3 sides instead of 4.",
        learningNote:
          "Working through this yourself helps build muscle memory for the basic commands and reinforces the relationship between geometry and code.",
        type: "solo_practice",
        expectedOutput: "Triangle shape",
        aiBlocked: true,
        conceptConnection:
          "You're applying the same sequential command pattern from the square, but adapting it for a different shape. This is the beginning of recognizing patterns in programming.",
        encouragement:
          "Don't worry if it takes a few tries! Programming is about experimenting and learning from each attempt.",
      },
    ],
  },
  {
    title: "Planning: Design Your House",
    description:
      "Think through your approach before coding by planning on paper.",
    type: "planning",
    completed: false,
    estimatedTime: "5 minutes",
    concepts: ["Planning", "Decomposition"],
    steps: [
      {
        instruction:
          "Sketch a plan on paper for drawing a simple house with a square base and triangle roof as if you are using turtle graphics",
        code: "# No coding yet - use physical paper and pen",
        hint: "Think about: What shapes do you need? In what order? What turtle commands?",
        tip: "Good planning makes coding much easier!",
        type: "pen_and_paper",
        questions: [
          "What shapes make up a house?",
          "In what order should you draw them?",
          "How will you position the triangle on top of the square?",
          "What turtle commands will you need?",
        ],
      },
    ],
  },
  {
    title: "Task 1: Draw a House with Functions",
    description:
      "Create a simple house using functions for procedural programming. This task teaches you how to break down complex problems into manageable pieces.",
    type: "procedural_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "15-20 minutes",
    paradigm: "procedural",
    conceptIntroduction: `Functions are like tools in a toolbox - once you create them, you can use them over and over again. In this task, you'll learn to build complex drawings by combining simple, reusable functions.

Think of it like this: instead of writing out every single step to draw a house each time, you'll create specialized "tools" (functions) for drawing squares and triangles. Then you can use these tools together to build a house, or any other structure you can imagine.

This approach demonstrates three key programming principles:
1. **Abstraction**: Hiding complexity behind simple names
2. **Encapsulation**: Packaging related code together  
3. **Reusability**: Using the same code for different purposes`,
    concepts: [
      "Abstraction and encapsulation of functionality",
      "Parameterization for code reuse",
      "Single Responsibility Principle",
      "State management in procedural programming",
    ],
    steps: [
      {
        instruction:
          "Write a Python function draw_square(t, size) that uses turtle graphics to draw a square with sides of length 'size'. This is your first step in creating reusable building blocks and introducing abstraction—hiding complexity behind a simple function name.",
        code: `import turtle

def draw_square(t, size):
    # Write code to draw a square of given size
    pass

# Test your function
t = turtle.Turtle()
draw_square(t, 50)`,
        hint: "Functions let you reuse code. Use a for loop: `for i in range(4):`. This demonstrates abstraction - hiding the details of how a square is drawn behind a simple function name.",
        tip: "The function should take a turtle object and size as parameters. By using a `size` parameter instead of a fixed value, you enable parameterization - allowing the function to be reused for squares of different sizes. This is a key advantage of abstraction and encapsulation of functionality.",
        learningNote:
          "Parameters make functions flexible. Without the `size` parameter, you'd need separate functions for every square size. With it, one function can draw any size square.",
        conceptConnection:
          "This is abstraction in action - the function name `draw_square` tells you what it does without revealing how it works internally.",
        aiGuidance:
          "If you're unsure about the loop structure or function syntax, try asking the AI: 'How do I create a function that draws a square using a for loop?'",
        requirements: ["Function definition", "Parameters", "Square drawing"],
        type: "function_creation",
      },
      {
        instruction:
          "Write a Python function draw_triangle(t, size) that uses turtle graphics to draw an equilateral triangle with sides of length 'size'. Notice how you're building a library of reusable shapes.",
        code: `
def draw_triangle(t, size):
    # Write code to draw a triangle of given size
    pass

# Test your triangle function  
draw_triangle(t, 50)`,
        preserveCode: true,
        appendCode: true,
        hint: "Triangles have 3 sides and use 120-degree turns (360° ÷ 3 = 120°).",
        tip: "Add this function below your existing `draw_square` function. Notice how parameterization allows this function to create triangles of any size - demonstrating code reuse through parameters. This continues to build your modular shape library. Each function should focus on one shape—this reflects the Single Responsibility Principle: each function does one thing well.",
        learningNote:
          "You're now building a toolkit of functions. Each function has a single, clear responsibility - this makes your code easier to understand and debug.",
        conceptConnection:
          "Both your square and triangle functions follow the same pattern: parameters → loop → turtle commands. This consistency makes your code predictable and maintainable.",
        aiGuidance:
          "If you need help with the triangle geometry, ask: 'What angle should a turtle turn to draw an equilateral triangle?' The AI can explain the math behind the 120-degree turns.",
        requirements: [
          "Triangle function",
          "120-degree turns",
          "Size parameter",
        ],
        type: "function_creation",
      },
      {
        instruction:
          "Write a Python function draw_house(t, size) that uses your draw_square and draw_triangle functions to draw a house with a square base and triangle roof. This demonstrates composition - building complex things from simple parts.",
        code: `
def draw_house(t, size):
    # Draw square base using draw_square function
    # Position turtle and draw triangle roof using draw_triangle function
    pass

# Test your house function
t.clear()
draw_house(t, 80)`,
        preserveCode: true,
        appendCode: true,
        hint: "Call both `draw_square` and `draw_triangle` functions. Position the triangle on top. This follows the Single Responsibility Principle - each function has one clear job.",
        tip: "Use `t.penup()`, `t.forward()`, `t.pendown()` to move between shapes. Notice how the draw_house function uses other functions rather than containing all the drawing code - this demonstrates the Single Responsibility Principle, where each function handles one specific task.",
        learningNote:
          "This is composition - your house function doesn't know HOW to draw squares or triangles, it just knows to call the right functions. This separation of concerns makes your code modular and easier to maintain.",
        conceptConnection:
          "You've created three levels of abstraction: turtle commands → shape functions → house function. Each level builds on the one below, hiding complexity and providing clear interfaces.",
        aiGuidance:
          "If you're struggling with positioning the triangle on top of the square, try asking: 'How do I move the turtle to the right position for the roof without drawing a line?'",
        encouragement:
          "You've just learned one of the most powerful concepts in programming: breaking complex problems into simple, reusable pieces!",
        requirements: [
          "Uses both functions",
          "Proper positioning",
          "Complete house",
        ],
        type: "composition",
      },
      {
        instruction:
          "Enhance your house by adding functions to draw a door and window using turtle graphics. This introduces precise positioning within shapes.",
        code: `# Optional: Add door/window functions below
def draw_door(t, size):
    # A door is a small rectangle at the bottom center of the house
    # You'll need to move the turtle to the door position without drawing
    pass

def draw_window(t, size):
    # A window is a small square in the upper part of the house
    # Remember to position the turtle first
    pass`,
        hint: "This is optional. Use `t.penup()` to move without drawing, then `t.pendown()` to start drawing again. A door could be a small rectangle, a window could be a small square.",
        tip: "This introduces an important concept: moving the turtle to specific positions within your drawing. Use `t.penup()` before moving to a new location, then `t.pendown()` before drawing. You'll need to calculate where on the house base to position these features. Only do this if you've completed the basic house and have extra time.",
        learningNote:
          "This is your first introduction to precise turtle positioning. Up until now, you've been drawing connected shapes, but doors and windows require moving to specific locations within the house without drawing connecting lines.",
        conceptConnection:
          "Pen control (`penup()`/`pendown()`) is essential for creating complex drawings with separate, non-connected elements. This is a fundamental skill for any turtle graphics project.",
        aiGuidance:
          "If you're unsure about positioning, try asking: 'How do I position a door at the bottom center of a square using turtle graphics coordinates?'",
        requirements: ["Optional extension", "Pen control", "Positioning"],
        type: "optional_extension",
        optional: true,
        preserveCode: true,
        appendCode: true,
      },
    ],
  },
  {
    title: "Task 2: Create a House Class",
    description:
      "Build reusable House objects using object-oriented programming. Learn how objects bundle data and behavior together.",
    type: "object_oriented_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "15-20 minutes",
    paradigm: "object_oriented",
    conceptIntroduction: `Object-oriented programming (OOP) is like creating blueprints for things in the real world. Think of a class as a blueprint for houses - it defines what every house should have (size, position) and what every house should be able to do (draw itself, move, etc.).

The key difference from procedural programming is that objects "know about themselves" and can maintain their own state. Instead of passing data around between functions, objects store their own data and provide methods to work with that data.

This approach offers several advantages:
1. **Encapsulation**: Data and the methods that work on that data are bundled together
2. **State Preservation**: Objects remember their properties between method calls
3. **Reusability**: You can create many different house objects from the same class
4. **Organization**: Related functionality is grouped together`,
    concepts: [
      "Instance variables for state preservation",
      "Object encapsulation",
      "Self reference in instance methods",
      "Template Method pattern for method organization",
    ],
    steps: [
      {
        instruction:
          "Create a Python House class with an __init__ method and add a draw_base method that draws a square at the house's position. This combines creating the blueprint and your first method. draw_house doesn’t need to know how squares and triangles are drawn—it delegates that work to specialized helpers.",
        code: `import turtle

class House:
    def __init__(self, size, x=0, y=0):
        # Initialize house properties
        self.size = size
        self.x = x
        self.y = y
        self.turtle = turtle.Turtle()
        
    def draw_base(self):
        # This method draws only the square base of the house.
        # It follows the Single Responsibility Principle: one method, one purpose.
        # Move turtle to position and draw square base
        self.turtle.penup()
        self.turtle.goto(self.x, self.y)
        self.turtle.pendown()
        #TODO: Draw square using self.size

        self.turtle.penup()

# Test your class - create one house and try the draw_base method
# TODO: After completing the draw_base method above, uncomment these lines to test:
# house = House(50, 0, 0)
# house.draw_base()`,
        hint: "Classes bundle data (size, position) with methods (actions). The `__init__` method is called when creating new objects. Use `self.turtle.goto(self.x, self.y)` to position, then draw the square using `self.size`.",
        tip: "The `__init__` method runs when you create a new House object. By storing size, x, and y as instance variables (`self.size`, `self.x`, `self.y`), we preserve these values for later use by the object's methods. Notice how the `draw_base` method uses `self.turtle` instead of receiving a turtle as a parameter like the procedural `draw_square` function did - this is object encapsulation in action.",
        learningNote:
          "In procedural programming, you’d need to pass size and position around manually. Here, your object handles that for you—making your code cleaner and more modular. The `self` parameter represents 'this particular house object'. Each house you create will have its own size, position, and turtle. This method 'belongs' to the house object and automatically knows which house's size and position to use.",
        conceptConnection:
          "Unlike procedural programming where data is passed between functions, OOP bundles data WITH the functions that operate on it. The house 'knows' its own size and position, and the draw_base method can access these directly.",
        aiGuidance:
          "If you're confused about `self` or need help with the drawing logic, try asking: 'What does self mean in a Python class?' or 'How do I draw a square using turtle graphics inside a class method?'",
        requirements: [
          "Class definition",
          "Constructor",
          "Method definition",
          "Uses self attributes",
          "Draws square",
        ],
        type: "class_definition_with_method",
        preserveCode: true,
        resetCode: true,
      },
      {
        instruction:
          "Add a draw_roof method to the House class that draws a triangle on top of the square base. This method will also 'know' how to position itself relative to the house. This method builds on your understanding of encapsulation. It uses the house’s own position and size to draw the roof.",
        code: `
    # TODO: comment the above test codes that test the draw_base method and complete the draw_roof method below
    def draw_roof(self):
        # Position turtle for roof and draw triangle on top of base
        # Hint: Use penup() to move to roof position, then pendown() to draw
        pass
        
# How would you test the code this time?`,
        hint: "Use penup() to move the turtle to the roof starting position, then pendown() to draw the triangle. Remember to use a for loop like you learned in Task 1!",
        tip: "Add this method after your draw_base method. Since draw_base ends with penup(), you can simply move the turtle to the starting corner of the roof and draw the triangle using the same for loop pattern you used in Task 1.",
        learningNote:
          "Notice how this method also automatically has access to all the house's properties (size, position, turtle) without needing them passed as parameters. That’s because the House encapsulates its own data.",
        conceptConnection:
          "Each method in the class can use the same instance variables (self.x, self.y, self.size, self.turtle). This shared state is what makes objects powerful.",
        aiGuidance:
          "If you're struggling with positioning the roof, ask: 'How do I move the turtle to draw a triangle on top of a square in turtle graphics?'",
        requirements: ["Roof method", "Proper positioning", "Triangle shape"],
        type: "method_implementation",
        preserveCode: true,
        appendCode: true,
      },
      {
        instruction:
          "Add a draw method to the House class that calls draw_base and draw_roof, then create and draw 3 different house instances. This method defines how a house is drawn, using smaller building blocks. It follows the Template Method Pattern, a design pattern where a high-level method coordinates calls to more specific methods.",
        code: `
    def draw_house(self):
        # Draw the complete house (base + roof)
        # The draw method organizes drawing a complete house.
        # It follows the Template Method Pattern: a high-level method calling other steps in order.
        # This way, we keep logic modular and easy to maintain.
        pass

# Create at least 3 different houses`,
        hint: "The draw method coordinates drawing the entire house by calling the other methods in the right order.",
        tip: "Add the draw method, then create multiple house instances to test. The `draw()` method calling more specialized methods (`draw_base` and `draw_roof`) demonstrates the Template Method pattern - a software design pattern where a higher-level method defines the skeleton of an operation and delegates specific steps to other methods.",
        learningNote:
          "Notice how easy it is to create multiple houses with different properties! Each house object maintains its own state independently. This is what makes your design scalable: you can now add more drawing steps (door, window) without changing how a house gets drawn overall.",
        conceptConnection:
          "This is the power of OOP: you define the class once, then create as many objects as you need. Each object is independent but follows the same 'blueprint'.",
        aiGuidance:
          "If you want to explore further, ask: 'How can I add more variety to my houses, like different colors or additional features?'",
        encouragement:
          "You've just learned how objects can encapsulate both data and behavior, making your code more organized and reusable!",
        requirements: [
          "Complete draw method",
          "At least 3 houses",
          "Different sizes/positions",
        ],
        type: "method_coordination",
        preserveCode: true,
        appendCode: true,
      },
      {
        instruction:
          "Enhance your House class by adding methods to draw doors and windows, plus optional color support. These methods will be automatically added to your class.",
        code: `    def draw_door(self):
        # Draw a door at the bottom center of the house base
        # Use self.turtle.penup() to move, then self.turtle.pendown() to draw
        pass
    
    def draw_window(self):
        # Draw a window in the upper part of the house base  
        # Remember: penup() to position, pendown() to draw
        pass

        
# Optional: Try adding color to your houses
# You can add a color parameter to __init__ and use self.turtle.color()

# Test your new methods:
`,
        hint: "This is optional. The methods will be automatically added inside your House class. Use `self.turtle.penup()` and `self.turtle.pendown()` to move to specific positions without drawing connecting lines.",
        tip: "These methods introduce precise positioning within objects. Calculate door/window positions relative to `self.x`, `self.y`, and `self.size`. The door might be at `(self.x + self.size//3, self.y)` and the window at `(self.x + self.size//4, self.y + self.size//2)`. This demonstrates how object methods can work together - first draw the house, then add details.",
        learningNote:
          "This shows how objects can have multiple methods that work on the same data. Each method (draw, draw_door, draw_window) operates on the same house instance, using its position and size properties.",
        conceptConnection:
          "Object methods can be called independently or in sequence. Unlike the procedural approach where you'd need to pass coordinates to each function, these methods automatically know where 'their' house is located.",
        aiGuidance:
          "If you need help with coordinate calculations, ask: 'How do I calculate the position for a door at the bottom center of a house object in turtle graphics?' or 'How can I add color support to my House class?'",
        requirements: ["Optional extension", "Method addition", "Pen control"],
        type: "optional_extension",
        optional: true,
        preserveCode: true,
        insertIntoClass: true, // Use smart insertion instead of append
      },
    ],
  },
];

// Helper function to get task metadata
export function getTaskMetadata(task) {
  return {
    type: task.type,
    paradigm: task.paradigm || "none",
    aiAllowed: task.aiAllowed,
    estimatedTime: task.estimatedTime,
    requirements: task.steps.flatMap((step) => step.requirements || []),
    hasOptionalSteps: task.steps.some((step) => step.optional),
    concepts: task.concepts || [], // Add concepts to metadata
  };
}
