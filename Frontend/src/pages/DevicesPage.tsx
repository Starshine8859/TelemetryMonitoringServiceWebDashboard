import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import DevicesTable from "@/components/Dashboard/DevicesTable";
import config from "../lib/config";
import { subDays, endOfDay } from "date-fns";

const apiUrl = config.apiUrl;

const DevicesPage = () => {
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [computerName, setComputerName] = useState("");
  const [loggedUser, setLoggedUser] = useState("");
  const [deviceList, setDeviceList] = useState([]);

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 6), // Last 7 days (including today)
    to: endOfDay(new Date()),
  });

  // Fetch devices from API
  async function getDevicesData({
    deviceId,
    computerName,
    loggedUser,
    dateRange,
  }) {
    try {
      const params = new URLSearchParams({
        deviceId: deviceId || "",
        computerName: computerName || "",
        loggedUser: loggedUser || "",
        dateFrom: dateRange.from ? dateRange.from.toISOString() : "",
        dateTo: dateRange.to ? dateRange.to.toISOString() : "",
      }).toString();

      const response = await fetch(
        `http://${apiUrl}/api/devices_laststatus?${params}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      return [];
    }
  }

  // Fetch on mount and whenever filters or date range change
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const data = await getDevicesData({
        deviceId,
        computerName,
        loggedUser,
        dateRange,
      });
      setDeviceList(data);
      setLoading(false);
    };
    fetchDevices();
  }, [deviceId, computerName, loggedUser, dateRange]);

  // Filter devices client-side by search inputs
  const filteredDevices = useMemo(() => {
    return deviceList.filter((device) => {
      const idMatch = device.rowKey
        ?.toLowerCase()
        .includes(deviceId.toLowerCase());
      const nameMatch = device.computerName
        ?.toLowerCase()
        .includes(computerName.toLowerCase());
      const userMatch = device.loggedOnUser
        ?.toLowerCase()
        .includes(loggedUser.toLowerCase());
      return idMatch && nameMatch && userMatch;
    });
  }, [deviceList, deviceId, computerName, loggedUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6 p-6 select-none"
    >
      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl text-gray-900 dark:text-white tracking-tight">
            Devices :{" "}
            <strong style={{ fontSize: "36px" }}>{filteredDevices.length}</strong>
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
          {/* Date Range Picker */}
          <div className="relative w-full sm:w-64 md:w-80">
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>

          {/* Device ID Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Computer Name Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Computer Name"
              value={computerName}
              onChange={(e) => setComputerName(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Logged On User Search */}
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Logged On User"
              value={loggedUser}
              onChange={(e) => setLoggedUser(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="w-full flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          // DevicesTable component for data display
          <DevicesTable devices={filteredDevices} />
        )}

        {/* No results message */}
        {filteredDevices.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              No devices found matching your criteria.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setDeviceId("");
                setComputerName("");
                setLoggedUser("");
                setDateRange({
                  from: subDays(new Date(), 6),
                  to: endOfDay(new Date()),
                });
              }}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DevicesPage;
