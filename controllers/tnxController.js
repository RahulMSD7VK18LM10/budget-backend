const Tnx = require("../models/tnxModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

process.loadEnvFile();
const JWT_SECRETE = process.env.JWT_SECRETE;

/* ───────────────── ADD TRANSACTION ───────────────── */

exports.addTnx = asyncHandler(async (req, res) => {
  const { amount, category, txnType, note, dot } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRETE);

  if (!amount || amount === 0) {
    return res.status(400).json({ message: "Amount cannot be zero" });
  }

  const lastTnx = await Tnx.findOne({
    user: decoded.id,
    dateOfTnx: dot,
  }).sort({ _id: -1 });

  let totalAmount = 0;

  if (!lastTnx) {
    totalAmount = txnType === "Expense" ? -amount : amount;
  } else {
    totalAmount =
      txnType === "Expense"
        ? lastTnx.totalAmount - amount
        : lastTnx.totalAmount + amount;
  }

  const createdTnx = await Tnx.create({
    user: decoded.id,
    amount,
    category,
    txnType,
    dateOfTnx: dot,
    note,
    totalAmount,
  });

  res.status(201).json(createdTnx);
});

/* ───────────────── GET ALL ───────────────── */

exports.getAllTnx = asyncHandler(async (req, res) => {
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRETE);
    const allTnx = await Tnx.find({ user: decoded.id }).sort({ _id: -1 });
    res.json(allTnx || []);
  }
  catch(err){
    console.log("Error in getAllTnx:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ───────────────── DELETE ───────────────── */

exports.deleteTnx = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRETE);
  const { tnxId } = req.params;

  const actionTnx = await Tnx.findById(tnxId);
  if (!actionTnx) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const affectedTnxes = await Tnx.find({
    user: decoded.id,
    _id: { $gt: tnxId },
    dateOfTnx: actionTnx.dateOfTnx,
  });

  for (const itm of affectedTnxes) {
    await Tnx.findByIdAndUpdate(itm._id, {
      totalAmount:
        actionTnx.txnType === "Expense"
          ? itm.totalAmount + actionTnx.amount
          : itm.totalAmount - actionTnx.amount,
    });
  }

  await Tnx.findByIdAndDelete(tnxId);

  // ✅ return deleted id for Redux
  res.json({ deletedId: tnxId });
});

/* ───────────────── UPDATE ───────────────── */
/**
 * @route PATCH /api/transaction/updateTnx
 */
exports.updateTnx = asyncHandler(async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRETE);
  const { tnxId, newAmount, newCategory, newNote } = req.body;

  const tnxToBeUpdated = await Tnx.findById(tnxId);
  if (!tnxToBeUpdated) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  const diff = newAmount - tnxToBeUpdated.amount;

  const affectedTnxes = await Tnx.find({
    user: decoded.id,
    _id: { $gt: tnxId },
    dateOfTnx: tnxToBeUpdated.dateOfTnx,
  });

  for (const itm of affectedTnxes) {
    await Tnx.findByIdAndUpdate(itm._id, {
      totalAmount:
        tnxToBeUpdated.txnType === "Expense"
          ? itm.totalAmount - diff
          : itm.totalAmount + diff,
    });
  }

  const updatedTnx = await Tnx.findByIdAndUpdate(
    tnxId,
    {
      amount: newAmount,
      category: newCategory,
      note: newNote,
      totalAmount:
        tnxToBeUpdated.txnType === "Expense"
          ? tnxToBeUpdated.totalAmount - diff
          : tnxToBeUpdated.totalAmount + diff,
    },
    { new: true }
  );

  // ✅ CRITICAL: return updated object
  res.json(updatedTnx);
});