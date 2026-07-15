const CertificateApplication = require("../../models/CertificateApplication");
const CertificateRecord = require("../../models/CertificateRecord");

const getReportsSummary = async (req, res, next) => {
  try {
    // 1. Count applications by status
    const statusCounts = await CertificateApplication.aggregate([
      {
        $group: {
          _id: { $toLower: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalApplications: 0,
      certificatesIssued: 0,
      monthlyIssuance: []
    };

    statusCounts.forEach(item => {
      const status = item._id;
      if (status === 'pending') summary.pending += item.count;
      else if (status === 'approved') summary.approved += item.count;
      else if (status === 'rejected') summary.rejected += item.count;
    });

    summary.totalApplications = summary.pending + summary.approved + summary.rejected;

    // 2. Count total certificates issued (including primary records)
    summary.certificatesIssued = await CertificateRecord.countDocuments();

    // 3. Certificates issued by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await CertificateRecord.aggregate([
      {
        $match: {
          issueDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$issueDate" },
            month: { $month: "$issueDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    summary.monthlyIssuance = monthlyData.map(item => {
      return {
        label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count
      };
    });

    return res.status(200).json({
      success: true,
      message: "Reports summary generated successfully",
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportsSummary
};
