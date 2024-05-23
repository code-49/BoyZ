const OrderModel = require("../models/orderModel");

async function getSalesData(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Query orders with status 'Delivered' and within the date range
  const orders = await OrderModel.find({
    status: "Delivered",
    createdAt: {
      $gte: start,
      $lte: end,
    },
  });

  return orders;
}

async function getDailySales(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);
  return getSalesData(startDate, endDate);
}

async function getWeeklySales(date) {
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of the week
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6); // End of the week
  endDate.setHours(23, 59, 59, 999);
  return getSalesData(startDate, endDate);
}

async function getYearlySales(date) {
  const year = new Date(date).getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  return getSalesData(startDate, endDate);
}

module.exports = {
  getDailySales,
  getWeeklySales,
  getYearlySales,
};
