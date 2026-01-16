# Landing Builder Components

This document describes all available components for the landing page builder.

## Component Categories

### Basic Components

#### Text
- **Description**: Simple text component with customizable styles
- **Props**: `text`, `type`, `level`, `style`
- **Use Case**: General text content

#### Button
- **Description**: Clickable button component
- **Props**: `text`, `type`, `size`, `style`
- **Use Case**: Call-to-action buttons

#### Container
- **Description**: Layout container for grouping components
- **Props**: `background`, `padding`, `style`
- **Use Case**: Organizing sections

#### Image
- **Description**: Image component with upload functionality
- **Props**: `src`, `alt`, `width`, `height`
- **Use Case**: Display images

---

## Step 1: User Information Form Components

### Header
- **Description**: Top banner with customizable background and text
- **Default**: "FREE Limited-Time WEB CLASS Reveals..." on dark blue background (RGB 7, 12, 54)
- **Customizable**:
  - Text content
  - Background color
  - Text color
  - Text transform (uppercase, lowercase, capitalize)
  - Font size
  - Padding

### Headline
- **Description**: Large headline with highlighted text portion
- **Default**: "How To Make An Additional $1,000 - $3,000 Per Day In Passive Income..."
- **Customizable**:
  - Main text
  - Highlighted text
  - Highlight color (default: yellow)
  - Underline on/off
  - Font size
  - Font weight
  - Text alignment

### Subtitle
- **Description**: Subtitle text below headline
- **Default**: "...Without expensive costs or tech-y skills."
- **Customizable**:
  - Text content
  - Font size
  - Color
  - Text alignment
  - Padding

### UserForm
- **Description**: User registration form with customizable fields
- **Default Fields**:
  - Name (required, cannot be removed)
  - Email (required, cannot be removed)
- **Optional Fields**:
  - Phone number
  - Address
  - Birthday
- **Customizable**:
  - Button text (default: "YES! I Want The Free Web Class")
  - Button color
  - Button text color
  - Field placeholders
  - Form max width
  - Padding

### InstructorBio
- **Description**: Two-column section with instructor photo and course benefits
- **Left Column**:
  - Instructor image
  - Bio text (default: "Glynn is an 8-figure award winner...")
- **Right Column**:
  - Section title
  - Benefits list with checkmarks
  - CTA button
  - Footer text
- **Customizable**:
  - Image URL
  - Instructor name
  - Bio text
  - Section title
  - Benefits list (comma-separated)
  - Button text, colors
  - Check icon color
  - Background color
  - Padding

---

## Step 2: Sales Page Components

### SuccessHeadline
- **Description**: Large bold success message
- **Default**: "Success! You're Registered For The Web Class!"
- **Customizable**:
  - Text content
  - Font size (default: 42px)
  - Font weight (default: 900)
  - Color
  - Padding

### VideoPlayer
- **Description**: Embedded video player (YouTube support)
- **Default**: Displays embedded YouTube video with title
- **Customizable**:
  - Video URL (supports YouTube links or embed URLs)
  - Video title
  - Width and height
  - Padding

### CountdownTimer
- **Description**: Live countdown timer with hours, minutes, seconds
- **Default**: 15-minute countdown
- **Features**:
  - Auto-counts down in real-time
  - Displays HOURS : MINUTES : SECONDS
- **Customizable**:
  - Label text
  - Initial time (hours, minutes, seconds)
  - Font size
  - Font weight
  - Number color
  - Label color
  - Background color
  - Padding

### SalesPageContent
- **Description**: Benefits list and CTA button with two-line text
- **Default**:
  - Confirmation text
  - 2 benefit items with checkmarks
  - Two-line CTA button
- **Customizable**:
  - Confirmation text
  - Benefits list (comma-separated)
  - Button main text (default: "Join The LIVE Room")
  - Button sub text (default: "Connect To The Web Class")
  - Button colors
  - Check icon color
  - Background color
  - Padding

### TwoColumnLayout
- **Description**: Responsive two-column grid layout
- **Use Case**: Organize video + timer/CTA side by side
- **Customizable**:
  - Left column width (e.g., "1fr", "300px")
  - Right column width
  - Gap between columns
  - Padding
  - Background color
  - Box shadow
  - Max width

---

## Common Components

### Footer
- **Description**: Complete footer with disclaimer, contact info, and copyright
- **Default Sections**:
  - Facebook disclaimer
  - Physical address
  - Support email
  - Terms & Privacy links
  - Copyright notice
- **Customizable**:
  - All text content
  - Background color
  - Text color
  - Link color
  - Text alignment
  - Font size
  - Padding

---

## Usage Instructions

### Adding Components to a Page

1. **Open the Landing Page Builder**
   - Navigate to Admin Dashboard > Landing Pages
   - Click "Edit" on a landing page
   - Select the step you want to edit (Step 1, 2, or 3)

2. **Add Components**
   - Components are organized in the right sidebar by category:
     - Basic Components
     - Step 1: User Info Form
     - Step 2: Sales Page
     - Common Components
   - Drag and drop components from the sidebar to the canvas

3. **Customize Components**
   - Click on any component to select it
   - The Settings panel will appear on the right
   - Modify properties like colors, text, sizes, etc.
   - Changes are reflected in real-time

4. **Save Your Work**
   - Click "Save Step 1/2/3" button at the top
   - Your changes are saved to the database

### Default Templates

Each step has a default template with pre-configured sections:

**Step 1 (User Info Form):**
- Header Banner
- Headline
- Subtitle
- User Form
- Instructor Bio
- Footer

**Step 2 (Sales Page):**
- Success Headline
- Two-Column Layout
  - Video Player (left)
  - Countdown Timer + Sales Content (right)
- Footer

### Best Practices

1. **Use Containers** for grouping related components
2. **Maintain Consistent Colors** across components for brand consistency
3. **Test Responsiveness** by previewing on different screen sizes
4. **Keep Forms Simple** - only include necessary fields
5. **Use Clear CTAs** with action-oriented button text

### Component Hierarchy

Components can be nested within containers:

```
Container
├── Header
├── Headline
├── Subtitle
├── UserForm
├── Container (InstructorBio)
│   ├── Image
│   └── Benefits List
└── Footer
```

### Customization Tips

- **Colors**: Use the color picker for backgrounds, text, and accents
- **Typography**: Adjust font sizes for hierarchy (larger = more important)
- **Spacing**: Use padding to add breathing room between sections
- **Alignment**: Center important CTAs, align text for readability

---

## Technical Notes

- All components are built with **Craft.js** for drag-and-drop functionality
- Components use **Ant Design** form controls in settings panels
- Styling is done with inline CSS for maximum flexibility
- All components support the `style` prop for additional custom styles
- Components are fully typed with **TypeScript**

## Future Enhancements

- Step 3 (Payment Page) components
- Mobile-specific layouts
- A/B testing variants
- Animation effects
- More layout options (3-column, grid, etc.)
