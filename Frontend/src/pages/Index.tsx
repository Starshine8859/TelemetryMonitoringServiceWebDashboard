import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  HardDrive,
  AlertTriangle,
  Database,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/Dashboard/DashboardCard";
import StatCard from "@/components/Dashboard/StatCard";
import GaugeChart from "@/components/Dashboard/GaugeChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import config from "../lib/config";
import { Download } from "lucide-react"; // or whichever icon package you're using

const apiUrl = config.apiUrl;

export type TrendData = {
  computerName: string;
  Cpu: number;
  Ram: number;
  Disk: number;
  crashCount: number;
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [osDistribution, setOsDistribution] = useState([]);
  const [lastUpdatedDevice, setLastUpdatedDevice] = useState(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 30);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0"); // Months are 0-based
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const getDeviceData = async () => {
      setLoading(true);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      try {
        const params = new URLSearchParams({
          deviceId: "",
          computerName: "",
          loggedUser: "",
          dateFrom: thirtyDaysAgo.toISOString() || "",
          dateTo: now.toISOString() || "",
        }).toString();

        const response = await fetch(
          `http://${apiUrl}/api/devices_laststatus?${params}`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const data = await response.json();
        setDevices(data.devices);
      } catch (error) {
        console.error("Failed to fetch device data:", error);
      }
      setLoading(false);
    };
    getDeviceData();
  }, []);

  useEffect(() => {
    setOsDistribution([
      {
        name: "Windows 11",
        count: devices.filter((item) => item.osVersion === "Windows 11").length,
      },
      {
        name: "Windows 10",
        count: devices.filter((item) => item.osVersion === "Windows 10").length,
      },
      {
        name: "Other",
        count: devices.filter(
          (item) => !["Windows 11", "Windows 10"].includes(item.osVersion)
        ).length,
      },
    ]);

    setLastUpdatedDevice(
      devices.length > 0
        ? devices.reduce((latest, item) => {
            return new Date(item.timestamp) > new Date(latest.timestamp)
              ? item
              : latest;
          }, devices[0])
        : null
    );

    const latestDevices = devices
      .slice()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    const trends = latestDevices.reverse().map((device) => ({
      computerName: device.computerName,
      Cpu: device.cpu,
      Ram: device.ram,
      Disk: device.diskUsing,
      crashCount: device.crashesCnt,
    }));

    setTrendData(trends);
  }, [devices]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center select-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
          />
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </motion.div>
    );
  }

  const handleDownload = async () => {
  try {
    const response = await fetch("/Monitoring1.5.zip");

    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Monitoring1.5.zip");
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6 p-6 select-none"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-right gap-4 mb-8">
        <h1 className="text-3xl text-gray-900 dark:text-white tracking-tight">
          Dashboard{" "}
          <small>
            ({formatDate(startDate)} – {formatDate(currentDate)})
          </small>
        </h1>
        <div className="flex flex-col md:flex-row md:justify-right md:items-right gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <Button
              size="sm"
              onClick={() => navigate("/devices")}
              className="px-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
            >
              <Database className="mr-2 h-4 w-4" />
              View All Devices
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <Button
              size="sm"
              onClick={() => handleDownload()}
              className="px-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download App
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            title: "Total Devices",
            value: devices.length,
            icon: <Database className="h-6 w-6" />,
            color: "blue",
          },
          {
            title: "Connected Today",
            value: devices.filter(
              (d) => d.timestamp > new Date().toISOString().split("T")[0]
            ).length,
            icon: <Cpu className="h-6 w-6" />,
            delta: Math.round(
              (devices.filter(
                (d) => d.timestamp > new Date().toISOString().split("T")[0]
              ).length /
                devices.length) *
                100
            ),
            deltaLabel: "of total",
            color: "green",
          },
          {
            title: "Offline Devices",
            value: devices.filter(
              (d) => d.timestamp < new Date().toISOString().split("T")[0]
            ).length,
            icon: <HardDrive className="h-6 w-6" />,
            color: "amber",
          },
          {
            title: "Total Errors",
            value: devices.reduce(
              (sum, item) => sum + (item.crashesCnt || 0),
              0
            ),
            icon: <AlertTriangle className="h-6 w-6" />,
            color: "red",
          },
        ].map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="flex" // Ensure cards stretch to match height
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              delta={card.delta}
              deltaLabel={card.deltaLabel}
              className="flex-1 h-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[150px]" // Added min-h for consistent height
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Latest Device Status Card */}
        <DashboardCard
          title="Latest Device Status"
          description={
            lastUpdatedDevice
              ? `Computer: ${lastUpdatedDevice.computerName}`
              : "No devices"
          }
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex flex-wrap justify-around gap-6 mt-8">
            {[
              { value: lastUpdatedDevice?.cpu ?? 0, label: "CPU Usage" },
              { value: lastUpdatedDevice?.ram ?? 0, label: "RAM Usage" },
              { value: lastUpdatedDevice?.diskUsing ?? 0, label: "Disk Usage" },
            ].map((gauge, index) => (
              <motion.div
                key={gauge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <GaugeChart
                  value={gauge.value}
                  label={gauge.label}
                  className="hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </DashboardCard>

        {/* OS Distribution Card */}
        <DashboardCard
          title="OS Distribution"
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
                >
                  {osDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                      tabIndex={-1} // <-- Important: disables focus outline on click/focus
                    />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {value}
                    </span>
                  )}
                />
                <Tooltip
                  formatter={(value) => [`${value} devices`, "Count"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(8px)",
                    color: "#1F2937",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </DashboardCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <DashboardCard
          title="Performance Trends & Network Protection"
          description="Real-time performance metrics with security status overview"
          className="backdrop-blur-sm bg-gradient-to-br from-white/80 to-blue-50/60 dark:from-gray-800/80 dark:to-blue-900/40 border border-blue-200/50 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="space-y-6">
            {/* Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  System Performance
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  {[
                    { color: "bg-blue-500", label: "CPU" },
                    { color: "bg-green-500", label: "RAM" },
                    { color: "bg-amber-500", label: "Disk" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${item.color}`}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }} // Increased bottom margin for full names
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="computerName"
                      tick={{
                        fontSize: 12,
                        angle: -45,
                        textAnchor: "end",
                        fill: "#6B7280",
                      }} // Rotated ticks for full names
                      height={60} // Increased height for rotated labels
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6B7280" }} // Ensured YAxis tick color is visible
                      label={{
                        value: "Usage (%)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#6B7280",
                          fontSize: "12px",
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                        backdropFilter: "blur(8px)",
                        color: "#1F2937",
                      }}
                      formatter={(value, name) => [
                        `${value}%`,
                        name.replace(/([A-Z])/g, " $1").trim(),
                      ]}
                      labelStyle={{ color: "#374151", fontWeight: "600" }}
                    />
                    <Bar
                      dataKey="Cpu"
                      name="CPU"
                      fill="url(#cpuGradient)"
                      radius={[6, 6, 0, 0]}
                      className="hover:opacity-80 transition-all duration-300"
                    />
                    <Bar
                      dataKey="Ram"
                      name="RAM"
                      fill="url(#ramGradient)"
                      radius={[6, 6, 0, 0]}
                      className="hover:opacity-80 transition-all duration-300"
                    />
                    <Bar
                      dataKey="Disk"
                      name="Disk"
                      fill="url(#diskGradient)"
                      radius={[6, 6, 0, 0]}
                      className="hover:opacity-80 transition-all duration-300"
                    />
                    <defs>
                      <linearGradient
                        id="cpuGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3B82F6"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1E40AF"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                      <linearGradient
                        id="ramGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10B981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#047857"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                      <linearGradient
                        id="diskGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F59E0B"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#D97706"
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Network Protection Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Network Protection Status
                </h3>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/security/networkProtection")}
                    className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    status: "Disabled",
                    count: devices.filter((d) => d.networkProtection === 0)
                      .length,
                    color: "red",
                    icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
                  },
                  {
                    status: "Block Mode",
                    count: devices.filter((d) => d.networkProtection === 1)
                      .length,
                    color: "green",
                    icon: <Database className="h-6 w-6 text-green-600" />,
                  },
                  {
                    status: "Audit Mode",
                    count: devices.filter((d) => d.networkProtection === 2)
                      .length,
                    color: "blue",
                    icon: <HardDrive className="h-6 w-6 text-blue-600" />,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/20 dark:to-${item.color}-800/20 rounded-lg p-4 border border-${item.color}-200/50 dark:border-${item.color}-700/30 shadow-sm hover:shadow-md transition-shadow duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <motion.div
                            animate={
                              item.status === "Disabled"
                                ? { scale: [1, 1.2, 1] }
                                : { scale: 1 }
                            }
                            transition={
                              item.status === "Disabled"
                                ? { duration: 1, repeat: Infinity }
                                : {}
                            }
                            className={`w-3 h-3 rounded-full bg-${item.color}-500`}
                          />
                          <span
                            className={`text-${item.color}-800 dark:text-${item.color}-200 font-semibold text-sm`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p
                          className={`text-2xl font-bold text-${item.color}-900 dark:text-${item.color}-100`}
                        >
                          {item.count}
                        </p>
                        <p
                          className={`text-${item.color}-600 dark:text-${item.color}-300 text-xs mt-1`}
                        >
                          {devices.length > 0
                            ? ((item.count / devices.length) * 100).toFixed(1)
                            : 0}
                          % of total
                        </p>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full bg-${item.color}-500/20 flex items-center justify-center`}
                      >
                        {item.icon}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    Protection Coverage
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">
                    {devices.length > 0
                      ? (
                          ((devices.filter((d) => d.networkProtection === 1)
                            .length +
                            devices.filter((d) => d.networkProtection === 2)
                              .length) /
                            devices.length) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          devices.length > 0
                            ? `${
                                (devices.filter(
                                  (d) => d.networkProtection === 1
                                ).length /
                                  devices.length) *
                                100
                              }%`
                            : "0%",
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-green-500"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          devices.length > 0
                            ? `${
                                (devices.filter(
                                  (d) => d.networkProtection === 2
                                ).length /
                                  devices.length) *
                                100
                              }%`
                            : "0%",
                      }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="bg-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>
                    Protected:{" "}
                    {
                      devices.filter(
                        (d) =>
                          d.networkProtection === 1 || d.networkProtection === 2
                      ).length
                    }{" "}
                    devices
                  </span>
                  <span>
                    Unprotected:{" "}
                    {devices.filter((d) => d.networkProtection === 0).length}{" "}
                    devices
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </DashboardCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <DashboardCard
          title="Crash Summary"
          className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[300px] mt-4"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }} // Increased bottom margin for full names
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="computerName"
                  tick={{
                    fontSize: 12,
                    angle: -45,
                    textAnchor: "end",
                    fill: "#6B7280",
                  }} // Rotated ticks for full names
                  height={60} // Increased height for rotated labels
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                  formatter={(value) => [`${value} crashes`, "Crashes"]}
                  labelStyle={{ color: "#374151", fontWeight: "600" }}
                />
                <Bar
                  dataKey="crashCount"
                  name="Crashes"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </DashboardCard>
      </motion.div>
    </motion.div>
  );
};

export default Index;
