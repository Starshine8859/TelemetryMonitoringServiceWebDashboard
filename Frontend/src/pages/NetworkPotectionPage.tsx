import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import config from "../lib/config";

const apiUrl = config.apiUrl;

const statusesName = ["Disabled", "Enabled (Block Mode)", "Audit Mode"];
const statuses = [0, 1, 2];

const NetworkProtectionPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [devices, setDevices] = useState<any[]>([]);

  // Fetch device data on initial load
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          deviceId: "",
          computerName: "",
          loggedUser: "",
          dateFrom: "",
          dateTo: "",
          networkProtection: "",
        }).toString();

        const response = await fetch(
          `http://${apiUrl}/api/devices_laststatus?${query}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const { devices: rawDevices = [] } = await response.json();

        const sortedDevices = [...rawDevices].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setDevices(sortedDevices);
      } catch (err) {
        console.error("Device fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          deviceId: "",
          computerName: "",
          loggedUser: "",
          dateFrom: "",
          dateTo: "",
          networkProtection: "",
        }).toString();

        const response = await fetch(
          `http://${apiUrl}/api/devices_laststatus?${query}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const { devices: rawDevices = [] } = await response.json();

        const sortedDevices = [...rawDevices].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setDevices(sortedDevices);
      } catch (err) {
        console.error("Device fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [reloadData]);

  const filteredDevices = devices.filter(
    (device) => Number(device.networkProtection) === selectedStatus
  );

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6 p-6 select-none"
    >
      <div className="flex items-between justify-between gap-2 truncate">
        <div>
          <h1 className="text-2xl font-semibold">
            Network Protection:{" "}
            <strong className="text-3xl">{devices.length}</strong>
          </h1>
        </div>
        <div style={{ paddingRight: "20px" }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              onClick={() => {
                setReloadData(!reloadData);
              }}
              className="px-5 shadow-sm hover:shadow-md transition-shadow duration-200 bg-info-500 hover:bg-info-600 dark:bg-info-400 dark:text-white dark:hover:bg-info-500"
            >
              <Upload className="mr-2 h-4 w-4 rotate-180" />
              ReloadData
            </Button>
          </motion.div>
        </div>
      </div>
      {/* Status Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statuses.map((status) => {
          const count = devices.filter(
            (d) => Number(d.networkProtection) === status
          ).length;

          return (
            <div
              key={`status-${status}`}
              onClick={() => setSelectedStatus(status)}
              className={`cursor-pointer border rounded-lg p-4 shadow-sm hover:shadow-md transition ${
                selectedStatus === status
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <h2 className="text-lg font-medium">{statusesName[status]}</h2>
              <p className="text-sm text-muted-foreground">
                {count} device{count !== 1 && "s"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Devices Table */}
      {loading ? (
        <div className="w-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-medium mb-2 text-foreground">
            {statusesName[selectedStatus]} – Devices ({filteredDevices.length})
          </h2>

          {filteredDevices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No devices found with {statusesName[selectedStatus]} status.
            </div>
          ) : (
            <div className="relative overflow-auto max-h-[70vh] border rounded-lg">
              <table
                className="w-max min-w-full text-sm border-collapse"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="sticky top-0 z-40 bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {[
                      "Computer Name",
                      "OS",
                      "User",
                      "Last Seen",
                      "CPU",
                      "RAM",
                      "Disk",
                      "Crashes",
                      "Actions",
                    ].map((label, index) => (
                      <th
                        key={label}
                        className={`px-3 py-3 text-center font-medium uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 ${
                          index === 0
                            ? "sticky left-0 z-50 bg-gray-100 dark:bg-gray-800"
                            : ""
                        }`}
                        style={{ minWidth: 150 }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => {
                    const lastSeen = parseISO(device.timestamp);
                    return (
                      <tr
                        key={`device-${device.deviceId}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors even:bg-white odd:bg-gray-100 dark:even:bg-gray-900 dark:odd:bg-gray-800"
                      >
                        <td
                          className="px-3 py-4 border-b font-medium text-center sticky left-0 z-30 bg-white dark:bg-gray-900 whitespace-nowrap"
                          title={device.computerName}
                        >
                          {device.computerName}
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.osVersion}
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.loggedOnUser}
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          <div className="text-sm">
                            <div>{format(lastSeen, "yyyy-MM-dd")}</div>
                            <div className="text-muted-foreground">
                              {formatDistanceToNow(lastSeen, {
                                addSuffix: true,
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.cpu}%
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.ram}%
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.disk}GB
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          {device.crashesCnt > 0 ? (
                            <span className="text-red-500 font-medium">
                              {device.crashesCnt}
                            </span>
                          ) : (
                            device.crashesCnt
                          )}
                        </td>
                        <td className="px-3 py-4 border-b text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(device.deviceId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default NetworkProtectionPage;
