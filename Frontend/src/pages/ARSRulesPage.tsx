import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Shield,
  Network,
  FileText,
  Lock,
  Cpu,
  HardDrive,
  Eye,
  Upload,
  Clock,
} from "lucide-react";
import config from "../lib/config";
const apiUrl = config.apiUrl;

const ASRComplianceMatrix = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const navigate = useNavigate();

  const getDeviceList = async () => {
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
  };

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const data = await getDeviceList();
      const sorted = data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setDeviceList(sorted);
      setLoading(false);
    };

    fetchDevices();
  }, [reloadData]);

  const handleViewDetails = (deviceId: string) => {
    navigate(`/devices/${deviceId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "0":
      case 0:
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case "1":
      case 1:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "2":
      case 2:
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "6":
      case 6:
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "0":
      case 0:
        return "N/A";
      case "1":
      case 1:
        return "Block";
      case "2":
      case 2:
        return "Audit";
      case "6":
      case 6:
        return "Off";
      default:
        return "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "block":
      case "on":
      case 1:
        return "text-green-400";
      case "audit":
      case 2:
        return "text-yellow-400";
      case "off":
      case 6:
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

    const columns = [
    {
      key: "name",
      label: "Device Name",
      shortLabel: "Device",
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      key: "Time",
      label: "Time",
      shortLabel: "Time",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      key: "NetworkProtection",
      label: "NetworkProtection",
      shortLabel: "NetworkProtection",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      key: "56a863a9-875e-4185-98a7-b882c64b5ce5",
      label: "Block abuse of exploited vulnerable signed drivers",
      shortLabel: "Signed Drivers",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      key: "7674ba52-37eb-4a4f-a9a1-f0f9a1619a2c",
      label: "Block Adobe Reader from creating child processes",
      shortLabel: "Adobe",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "d4f940ab-401b-4efc-aadc-ad5f3c50688a",
      label: "Block all Office applications from creating child processes",
      shortLabel: "Office Child",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2",
      label: "Block credential stealing from LSASS",
      shortLabel: "LSASS",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      key: "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550",
      label: "Block executable content from email client and webmail",
      shortLabel: "Email Executable",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "01443614-cd74-433a-b99e-2ecdc07bfc25",
      label: "Block executables unless they meet trust criteria",
      shortLabel: "Trust Executable",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "5beb7efe-fd9a-4556-801d-275e5ffc04cc",
      label: "Block obfuscated scripts",
      shortLabel: "Obfuscated Scripts",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "d3e037e1-3eb8-44c8-a917-57927947596d",
      label: "Block JS or VBScript from launching downloaded executables",
      shortLabel: "Script EXEs",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "3b576869-a4ec-4529-8536-b80a7769e899",
      label: "Block Office applications from creating executables",
      shortLabel: "Office EXE",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "75668c1f-73b5-4cf0-bb93-3ecf5cb7cc84",
      label:
        "Block Office applications from injecting code into other processes",
      shortLabel: "Office Inject",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "26190899-1602-49e8-8b27-eb1d0a1ce869",
      label: "Block Office comms app from creating child processes",
      shortLabel: "Office Comms",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "e6db77e5-3df2-4cf1-b95a-636979351e5b",
      label: "Block persistence via WMI event subscription",
      shortLabel: "WMI Persistence",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "d1e49aac-8f56-4280-b9ba-993a6d77406c",
      label: "Block process creation via PSExec and WMI",
      shortLabel: "PSExec/WMI",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      key: "33ddedf1-c6e0-47cb-833e-de6133960387",
      label: "Block Safe Mode rebooting",
      shortLabel: "Safe Mode",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4",
      label: "Block unsigned processes from USB",
      shortLabel: "USB Unsigned",
      icon: <HardDrive className="w-4 h-4" />,
    },
    {
      key: "c0033c00-d16d-4114-a5a0-dc9b3a7d2ceb",
      label: "Block copied or impersonated system tools",
      shortLabel: "Fake Tools",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      key: "a8f5898e-1dc8-49a9-9878-85004b8a61e6",
      label: "Block Webshell creation on Servers",
      shortLabel: "Webshells",
      icon: <Network className="w-4 h-4" />,
    },
    {
      key: "92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b",
      label: "Block Win32 API calls from Office macros",
      shortLabel: "Win32 Macros",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      key: "c1db55ab-c21a-4637-bb3f-a12568109d35",
      label: "Use advanced ransomware protection",
      shortLabel: "Ransomware Prot.",
      icon: <Shield className="w-4 h-4" />,
    },
    {
      key: "status",
      label: "Action",
      shortLabel: "Action",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white ">
      {/* Matrix Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        {columns.slice(3, -1).flatMap((column) =>
          [0, 1, 2, 6].map((val) => {
            const count = deviceList.filter((d) => {
              try {
                console.log(typeof d.ASRRules === "string"
                    ? JSON.parse(d.ASRRules)
                    : d.ASRRules)
                const rules =
                  typeof d.ASRRules === "string"
                    ? JSON.parse(d.ASRRules)
                    : d.ASRRules;
                if (val === 0){
                  return rules[column.key] === val || rules[column.key] === undefined;
                }
                return rules[column.key] == val  ;
              } catch (e) {
                return 0;
              }
            }).length;

            return (
              <div
                key={`status-${column.key}-${val}`}
                className="cursor-pointer border rounded-lg p-3 shadow-sm hover:shadow-md "
              >
                <h2 className="text">
                  {column.label} - {getStatusText(val)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {count} device{count !== 1 && "s"}
                </p>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">
          ASR Rules: <strong className="text-3xl">{deviceList.length}</strong>
        </h1>
          <Button
            size="sm"
            onClick={() => setReloadData(!reloadData)}
            className="px-5 bg-info-500 hover:bg-info-600 dark:bg-info-400 dark:text-white dark:hover:bg-info-500"
          >
            <Upload className="mr-2 h-4 w-4 rotate-180" />
            Reload Data
          </Button>
      </div>

      {loading ? (
        <div className="w-full flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : deviceList.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No devices found. Try reloading.
        </div>
      ) : (
        <div>
          <div className="overflow-auto max-h-[70vh] border border-gray-300 dark:border-gray-700 rounded-lg">
            <table className="w-full min-w-max text-sm table-fixed border-collapse">
              <thead className="sticky top-0 z-40 bg-gray-100 dark:bg-gray-800">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={col.key}
                      className={`px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 min-w-32 align-middle ${
                        index === 0
                          ? "sticky left-0 z-50 bg-gray-100 dark:bg-gray-800"
                          : ""
                      }`}
                    >
                      <div
                        className="flex items-center justify-center gap-2 truncate"
                        title={col.label}
                      >
                        <div className="text-gray-600 dark:text-gray-300">
                          {col.icon}
                        </div>
                        <div className="text-xs font-medium truncate max-w-[200px]">
                          {col.shortLabel || col.label}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deviceList.map((device) => {
                  let rules = {};
                  try {
                    rules =
                      typeof device.ASRRules === "string"
                        ? JSON.parse(device.ASRRules)
                        : device.ASRRules;
                  } catch (e) {
                    rules = {};
                  }

                  return (
                    <tr
                      key={device.deviceId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors even:bg-white odd:bg-gray-100 dark:even:bg-gray-900 dark:odd:bg-gray-800"
                    >
                      <td
                        className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 font-medium sticky left-0 z-30 bg-white dark:bg-gray-900 align-middle whitespace-nowrap text-center"
                        style={{ width: 150 }}
                        title={device.computerName}
                      >
                        {device.computerName}
                      </td>

                      <td className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center">
                        <div className="flex flex-col items-center">
                          <div>
                            {format(new Date(device.timestamp), "yyyy-MM-dd")}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(device.timestamp), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(device.networkProtection)}
                          <span
                            className={getStatusColor(device.networkProtection)}
                          >
                            {getStatusText(device.networkProtection)}
                          </span>
                        </div>
                      </td>

                      {columns.slice(3, -1).map((col) => {
                        const status =
                          rules[col.key] !== undefined
                            ? rules[col.key]
                            : "unknown";
                        return (
                          <td
                            key={col.key}
                            className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center"
                          >
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(status)}
                              <span className={getStatusColor(status)}>
                                {getStatusText(status)}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      <td className="px-3 py-4 border-b border-gray-200 dark:border-gray-700 text-center">
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
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-green-400">= Block</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400">= Audit</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400">= Off</span>
        </div>
      </div>
    </div>
  );
};

export default ASRComplianceMatrix;
