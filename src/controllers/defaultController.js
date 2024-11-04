const display = (req, res) => {
  try {
    console.log("hello");
    res.status(200).json("hello");
  } catch (error) {
    res.status(500).json({ message: "Error ", error });
  }
};

// Exporting the display function
module.exports = {
  display,
};
