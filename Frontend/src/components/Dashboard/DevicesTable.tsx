import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeviceSummary } from "@/lib/mock-data";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Eye } from "lucide-react";

type DevicesTableProps = {
  devices: DeviceSummary[];
  limit?: number;
};

const DevicesTable = ({ devices, limit }: DevicesTableProps) => {
  const navigate = useNavigate();

  const displayDevices = useMemo(() => {
    return limit ? devices.slice(0, limit) : devices;
  }, [devices, limit]);

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
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
          {displayDevices.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="text-center py-10 text-muted-foreground"
              >
                No devices found
              </td>
            </tr>
          ) : (
            displayDevices.map((device) => {
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
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DevicesTable;
