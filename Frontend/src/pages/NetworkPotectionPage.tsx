import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import config from "../lib/config";

const apiUrl = config.apiUrl;

const statusesName = ["Disabled", "Enabled (Block Mode)", "Audit Mode"];
const statuses = [0, 1, 2];

const NetworkProtectionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [deviceList, setDeviceList] = useState<any[]>([]);

  async function getDeviceList() {
    try {
      const params = new URLSearchParams({
        deviceId: "",
        computerName: "",
        loggedUser: "",
        dateFrom: "",
        dateTo: "",
        networkProtection: "",
      }).toString();

      const response = await fetch(
        `http://${apiUrl}/api/devices_laststatus?${params}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    }
  }

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      let data = await getDeviceList();

      data = [...data].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setDeviceList(data);
      setLoading(false);
    };

    fetchDevices();
  }, [selectedStatus]);

  const filteredDevices = deviceList.filter(
    (d) => Number(d.networkProtection) === Number(selectedStatus)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6 p-6 select-none"
    >
      <h1 className="text-2xl font-semibold">
        Network Protection:{" "}
        <strong className="text-3xl">{deviceList.length}</strong>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <div
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`cursor-pointer border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition ${
              selectedStatus === status
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-foreground"
            }`}
          >
            <h2 className="text-lg font-medium">{statusesName[status]}</h2>
            <p className="text-sm text-muted-foreground">
              {
                deviceList.filter(
                  (d) => Number(d.networkProtection) === Number(status)
                ).length
              }{" "}
              device(s)
            </p>
          </div>
        ))}
      </div>

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
            <div
              className="relative overflow-auto max-h-[70vh] border border-gray-300 dark:border-gray-700 rounded-lg"
              style={{ scrollbarWidth: "thin" }}
            >
              <table
                className="w-max min-w-full text-sm border-collapse"
                style={{ tableLayout: "fixed" }}
              >
                <thead className="sticky top-0 z-40 bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {/* Sticky first column header */}
                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle sticky left-0 z-50 bg-gray-100 dark:bg-gray-800"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      Computer Name
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      OS
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      User
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      Last Seen
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      CPU
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      RAM
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      Disk
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      Crashes
                    </th>

                    <th
                      className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 align-middle"
                      style={{ minWidth: 150, height: 50 }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDevices.map((device) => {
                    const lastSeen = parseISO(device.timestamp);
                    return (
                      <tr
                        key={device.deviceId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors even:bg-white odd:bg-gray-100 dark:even:bg-gray-900 dark:odd:bg-gray-800"
                      >
                        {/* Sticky first column */}
                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 font-medium sticky left-0 z-30 bg-white dark:bg-gray-900 whitespace-nowrap text-center"
                          style={{ minWidth: 150 }}
                          title={device.computerName}
                        >
                          {device.computerName}
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.osVersion}
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.loggedOnUser}
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          <div className="text-sm">
                            <div>{format(lastSeen, "yyyy-MM-dd")}</div>
                            <div className="text-muted-foreground">
                              {formatDistanceToNow(lastSeen, { addSuffix: true })}
                            </div>
                          </div>
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.cpu}%
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.ram}%
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.disk}GB
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
                          {device.crashesCnt > 0 ? (
                            <span className="text-red-500 font-medium">
                              {device.crashesCnt}
                            </span>
                          ) : (
                            device.crashesCnt
                          )}
                        </td>

                        <td
                          className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          style={{ minWidth: 150 }}
                        >
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
