export const getTotalsales = async (_req, res) => {
    try {
        const totalSales = 0;
        res.json({ totalSales });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get total sales" });
    }
};
