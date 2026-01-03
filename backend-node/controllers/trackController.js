import Track from "../models/Track.js";

export const createTrack = async (req, res) => {
  try {
    const track = new Track({
      ...req.body,
      userId: req.userId 
    });
    await track.save();
    res.status(201).json(track);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ userId: req.userId });
    res.json(tracks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateTrack = async (req, res) => {
  try {
    const { id } = req.params;
    
    const track = await Track.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!track) {
      return res.status(404).json({ error: "Track not found or unauthorized" });
    }

    res.json(track);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;

    const track = await Track.findOneAndDelete({ _id: id, userId: req.userId });

    if (!track) {
      return res.status(404).json({ error: "Track not found or unauthorized" });
    }

    res.json({ message: "Track deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};