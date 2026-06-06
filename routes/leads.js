const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");
const auth = require("../middleware/auth");

// ================= GET ALL LEADS =================
router.get("/", auth, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Error loading leads" });
  }
});


// ================= ADD LEAD =================
router.post("/", auth, async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body); 

    const { name, email, source, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email required" });
    }

    const lead = new Lead({
      name,
      email,
      source,
      status
    });

    await lead.save();

    res.json({ message: "Lead added successfully" });

  } catch (err) {
    console.log("ERROR ADDING LEAD:", err); 
    res.status(500).json({ message: "Error adding lead" });
  }
});

// ================= UPDATE STATUS =================
router.put("/:id", auth, async (req, res) => {
  try {
    await Lead.findByIdAndUpdate(req.params.id, {
      status: req.body.status
    });

    res.json({ message: "Status updated" });

  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});


// ================= ADD NOTE =================
router.post("/:id/notes", auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead.notes) {
      lead.notes = [];
    }

    lead.notes.push({
      text: req.body.text,
      date: new Date()
    });

    await lead.save();

    res.json({ message: "Note added" });

  } catch (err) {
    res.status(500).json({ message: "Error adding note" });
  }
});


// ================= DELETE LEAD =================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting lead" });
  }
});

module.exports = router;