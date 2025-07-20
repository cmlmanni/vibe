/* filepath: /js/modules/tutorial/tutorialData.js */
export const tutorialTasks = [
  {
    title: "Foundation: Understanding Turtle Graphics",
    description: "Learn the basics by seeing how turtle graphics works, then practice independently.",
    type: "foundation",
    aiAllowed: false,
    completed: false,
    estimatedTime: "8-10 minutes",
    steps: [
      {
        instruction: "Study this complete square example. What does it do?",
        code: `import turtle
t = turtle.Turtle()
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)
t.forward(100)
t.right(90)`,
        hint: "This shows the basic turtle commands. Notice how each side is drawn separately.",
        tip: "Understanding this foundation will help you with all future tasks.",
        type: "demonstration",
      },
      {
        instruction: "Now practice on your own: Draw a triangle.",
        code: "# Try drawing a triangle using turtle commands\n# Hint: A triangle has 3 sides and turns 120 degrees",
        hint: "A triangle has 3 sides. Each turn should be `120` degrees (`360° ÷ 3`).",
        tip: "Use `forward()` and `right()` commands like in the square example.",
        type: "solo_practice",
        expectedOutput: "Triangle shape",
        aiBlocked: true,
      },
    ],
  },
  {
    title: "Planning: Design Your House",
    description: "Think through your approach before coding by planning on paper.",
    type: "planning",
    completed: false,
    estimatedTime: "5 minutes",
    steps: [
      {
        instruction: "Use pen and paper to plan drawing a simple house (square base + triangle roof)",
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
    title: "Task 1: Draw a House",
    description: "Code your house design using basic turtle commands with AI assistance.",
    type: "procedural_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "12-15 minutes",
    paradigm: "procedural",
    steps: [
      {
        instruction: "Set up your turtle and start coding your house design",
        code: `import turtle
t = turtle.Turtle()
# Start coding your house here`,
        hint: "Begin with importing turtle and creating a turtle object, just like the examples.",
        tip: "Start with the square base, then add the triangle roof on top.",
        type: "guided_coding",
      },
      {
        instruction: "Draw the square base of your house",
        code: "# Draw a square for the house base\n# Use basic forward() and right() commands",
        hint: "A square needs 4 sides of equal length with 90-degree turns.",
        tip: "You can use the pattern from the foundation example.",
        requirements: ["Square base", "Proper positioning"],
        type: "step_by_step",
      },
      {
        instruction: "Add a triangle roof on top of the square",
        code: "# Move to the top of the square\n# Draw a triangle roof",
        hint: "You'll need to position the turtle at the top-left of the square, then draw the triangle.",
        tip: "Remember: triangles use 120-degree turns.",
        requirements: ["Triangle roof", "Positioned on square", "Connected properly"],
        type: "step_by_step",
      },
      {
        instruction: "Test and refine your house drawing",
        code: "# Run your complete house code\n# Make adjustments if needed",
        hint: "Your house should have a clear square base and triangle roof.",
        tip: "If shapes don't connect properly, adjust the positioning commands.",
        type: "testing_refinement",
      },
    ],
  },
  {
    title: "Task 2: Create Reusable Shape Functions",
    description: "Refactor your approach using functions for modularity and reuse.",
    type: "functional_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "12-15 minutes",
    paradigm: "functional",
    steps: [
      {
        instruction: "Create a function to draw squares of any size",
        code: `def draw_square(turtle_obj, size):
    # Write code to draw a square of given size
    pass

# Test your function
t = turtle.Turtle()
draw_square(t, 100)`,
        hint: "Functions let you reuse code. The function should take a turtle and size as parameters.",
        tip: "Use a for loop inside the function to make it cleaner: `for i in range(4)`:",
        requirements: ["Function definition", "Parameters", "Reusable code"],
        type: "function_creation",
      },
      {
        instruction: "Create a function to draw triangles of any size",
        code: `def draw_triangle(turtle_obj, size):
    # Write code to draw a triangle of given size
    pass

# Test your function  
draw_triangle(t, 100)`,
        hint: "Similar to `draw_square`, but triangles have 3 sides and 120-degree turns.",
        tip: "You can use: `for i in range(3)`: to repeat the triangle drawing.",
        requirements: ["Triangle function", "Proper angles", "Size parameter"],
        type: "function_creation",
      },
      {
        instruction: "Create a draw_house function that uses both shape functions",
        code: `def draw_house(turtle_obj, size):
    # Use your draw_square and draw_triangle functions
    # Position the triangle on top of the square
    pass

# Test drawing multiple houses
draw_house(t, 80)
# Move turtle and draw another house
draw_house(t, 120)`,
        hint: "Your `draw_house` function should call both `draw_square` and `draw_triangle`.",
        tip: "You'll need to move the turtle between drawing the square and triangle.",
        requirements: ["Combines both functions", "Proper positioning", "Multiple houses"],
        type: "composition",
      },
      {
        instruction: "Create a neighborhood with houses of different sizes",
        code: `# Clear the screen and draw multiple houses
t.clear()
# Draw 3-4 houses of different sizes in different positions`,
        hint: "Use your `draw_house` function multiple times with different sizes and positions.",
        tip: "Use `t.penup()`, `t.goto(x, y)`, `t.pendown()` to move between house locations.",
        requirements: ["Multiple houses", "Different sizes", "Good spacing"],
        type: "creative_application",
      },
    ],
  },
  {
    title: "Task 3: Build a House Class",
    description: "Create a House class for maximum reusability and customization.",
    type: "object_oriented_programming",
    aiAllowed: true,
    completed: false,
    estimatedTime: "12-15 minutes",
    paradigm: "object_oriented",
    aiChoice: "participant_choice",
    steps: [
      {
        instruction: "Define a House class with initialization",
        code: `class House:
    def __init__(self, size, color='black', x=0, y=0):
        self.size = size
        self.color = color
        self.x = x
        self.y = y
        self.turtle = turtle.Turtle()
        
    # Add methods below`,
        hint: "Classes bundle data (size, color, position) with methods (actions).",
        tip: "The `__init__` method runs when you create a new House object.",
        requirements: ["Class definition", "Constructor", "Instance variables"],
        type: "class_definition",
      },
      {
        instruction: "Add a draw_base method to your House class",
        code: `    def draw_base(self):
        # Move turtle to position and draw the square base
        # Use self.size, self.color, self.x, self.y
        pass`,
        hint: "Methods in a class can access the object's data using `self.attribute_name`.",
        tip: "Use `self.turtle.goto(self.x, self.y)` to position, then draw the square.",
        requirements: ["Method definition", "Uses self attributes", "Draws square"],
        type: "method_implementation",
      },
      {
        instruction: "Add a draw_roof method to your House class",
        code: `    def draw_roof(self):
        # Position turtle and draw triangle roof
        # Make sure it sits on top of the base
        pass`,
        hint: "The roof should be positioned at the top of the square base.",
        tip: "Calculate the roof position based on `self.x`, `self.y`, and `self.size`.",
        requirements: ["Roof method", "Proper positioning", "Triangle shape"],
        type: "method_implementation",
      },
      {
        instruction: "Add a complete draw method that draws the whole house",
        code: `    def draw(self):
        # Set the turtle color and draw the complete house
        # Call both draw_base and draw_roof
        pass
        
# Test your House class
house1 = House(80, 'blue', -100, 0)
house1.draw()

house2 = House(120, 'red', 100, 0)  
house2.draw()`,
        hint: "The draw method should coordinate drawing the entire house.",
        tip: "Use `self.turtle.color(self.color)` to set the color before drawing.",
        requirements: ["Complete draw method", "Uses color", "Calls other methods"],
        type: "method_coordination",
      },
      {
        instruction: "Create a custom neighborhood with styled houses",
        code: `# Create multiple House objects with different properties
# Try different sizes, colors, and positions
# Add any extra features you want!`,
        hint: "Now you can easily create many different houses with custom properties.",
        tip: "Try adding features like doors, windows, or different roof styles!",
        requirements: ["Multiple objects", "Different properties", "Creative additions"],
        type: "creative_showcase",
        bonus: "Add extra features like doors, windows, or different colors!",
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
    aiChoice: task.aiChoice || "assigned",
    estimatedTime: task.estimatedTime,
    requirements: task.steps.flatMap((step) => step.requirements || []),
  };
}