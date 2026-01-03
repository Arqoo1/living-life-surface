import Moment from "../models/Moment.js";

export const getMoments = async (req, res) => {
  try {
    const moments = await Moment.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json(moments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMoment = async (req, res) => {
  try {
    const { title, content, date, type } = req.body;
    
    const newMoment = new Moment({
      title,
      content,
      date,
      type,
      userId: req.userId, 
    });

    const savedMoment = await newMoment.save();
    res.status(201).json(savedMoment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateMoment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedMoment = await Moment.findOneAndUpdate(
      { _id: id, userId: req.userId }, 
      req.body,
      { new: true } 
    );

    if (!updatedMoment) {
      return res.status(404).json({ error: "Moment not found or unauthorized" });
    }

    res.status(200).json(updatedMoment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteMoment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMoment = await Moment.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deletedMoment) {
      return res.status(404).json({ error: "Moment not found or unauthorized" });
    }

    res.status(200).json({ message: "Moment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}