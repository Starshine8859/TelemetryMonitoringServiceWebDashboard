import { useEffect, useState } from "react";
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
  const [selectedStatus, setSelectedStatus] = useState<number>(0); // Initialize with 1 directly
  const [deviceList, setDeviceList] = useState([]);

  async function getDeviceList() {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        deviceId: "",
        computerName: "",
        loggedUser: "",
        dateFrom: thirtyDaysAgo.toISOString() || "",
        dateTo: "",
        networkProtection: "",
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
      return data.devices; // Expected to return device data array
    } catch (error) {
      console.error('Error fetching devices:', error);
      return []; // Return empty array on failure
    }
  }

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      let data = await getDeviceList();
      
      data = [...data].sort((a, b) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
      setDeviceList(data); // Update state with fetched data
      setLoading(false);
    };

    fetchDevices();
  }, [selectedStatus]);

  // Helper function to filter devices with type safety
  const getFilteredDevices = () => {
    return deviceList.filter((d) => {
      // Convert both to numbers for comparison to handle type mismatches
      return Number(d.networkProtection) === Number(selectedStatus);
    });
  };

  const filteredDevices = getFilteredDevices();

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <h1 className="text-2xl font-semibold">
        Network Protection – Exploit Guard <strong style={{fontSize:'32px'}}>{deviceList.length}</strong>device(s)
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
                deviceList.filter((d) => {
                  return Number(d.networkProtection) === Number(status);
                }).length
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
            <div className="overflow-x-auto">
              <table className="min-w-full border border-border text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 border border-border">
                      Computer Name
                    </th>
                    <th className="px-4 py-2 border border-border">OS</th>
                    <th className="px-4 py-2 border border-border">User</th>
                    <th className="px-4 py-2 border border-border">
                      Last Seen
                    </th>
                    <th className="px-4 py-2 border border-border">CPU</th>
                    <th className="px-4 py-2 border border-border">RAM</th>
                    <th className="px-4 py-2 border border-border">Disk</th>
                    <th className="px-4 py-2 border border-border">Crashes</th>
                    <th className="px-4 py-2 border border-border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device) => (
                    <tr
                      key={device.deviceId}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      <td className="px-4 py-2 border border-border">
                        {device.computerName}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.osVersion}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.loggedOnUser}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <div className="text-sm">
                          <div>
                            {format(parseISO(device.timestamp), "yyyy-MM-dd")}
                          </div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(parseISO(device.timestamp), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.cpu}%
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.ram}%
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.disk}GB
                      </td>
                      <td className="px-4 py-2 border border-border">
                        {device.crashesCnt > 0 ? (
                          <span className="text-red-500 font-medium">
                            {device.crashesCnt}
                          </span>
                        ) : (
                          device.crashesCnt
                        )}
                      </td>
                      <td className="px-4 py-2 border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(device.deviceId)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkProtectionPage;