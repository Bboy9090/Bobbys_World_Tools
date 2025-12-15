import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  MagnifyingGlass, 
  Download, 
  DeviceMobile, 
  Info,
  CheckCircle,
  Warning,
  FolderOpen,
  Package
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useApp } from '@/lib/app-context';

interface FirmwareFile {
  id: string;
  version: string;
  buildNumber: string;
  androidVersion?: string;
  iosVersion?: string;
  releaseDate: string;
  size: string;
  downloadUrl: string;
  checksumMD5: string;
  checksumSHA256: string;
  isOfficial: boolean;
  isSecurityPatch: boolean;
  region: string;
  carrier?: string;
  notes?: string;
}

interface DeviceModel {
  model: string;
  codename: string;
  marketingName: string;
  releaseYear: number;
  firmwares: FirmwareFile[];
}

interface BrandFirmwares {
  brand: string;
  logo?: string;
  devices: DeviceModel[];
}

export function FirmwareLibrary() {
  const { isDemoMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<DeviceModel | null>(null);
  const [firmwareData, setFirmwareData] = useState<BrandFirmwares[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFirmwareDatabase();
  }, [isDemoMode]);

  const loadFirmwareDatabase = async () => {
    setIsLoading(true);
    
    if (isDemoMode) {
      setTimeout(() => {
        setFirmwareData(getMockFirmwareData());
        setIsLoading(false);
      }, 500);
    } else {
      try {
        const response = await fetch('http://localhost:3001/api/firmware/database');
        if (response.ok) {
          const data = await response.json();
          setFirmwareData(data.brands || []);
        } else {
          setFirmwareData([]);
        }
      } catch (error) {
        console.error('[FirmwareLibrary] Failed to load firmware database:', error);
        setFirmwareData([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownloadFirmware = async (firmware: FirmwareFile, deviceModel: string) => {
    if (isDemoMode) {
      toast.info(`[DEMO] Would download ${firmware.version} for ${deviceModel}`);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/firmware/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmwareId: firmware.id,
          deviceModel,
          downloadUrl: firmware.downloadUrl
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deviceModel}_${firmware.version}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Downloading ${firmware.version} for ${deviceModel}`);
      } else {
        toast.error('Failed to download firmware');
      }
    } catch (error) {
      console.error('[FirmwareLibrary] Download error:', error);
      toast.error('Download failed - check backend connection');
    }
  };

  const handleVerifyChecksum = (firmware: FirmwareFile) => {
    toast.info(`MD5: ${firmware.checksumMD5}\nSHA256: ${firmware.checksumSHA256}`, {
      duration: 10000
    });
  };

  const filteredBrands = firmwareData.filter(brand => {
    if (selectedBrand !== 'all' && brand.brand !== selectedBrand) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return brand.devices.some(device => 
        device.model.toLowerCase().includes(query) ||
        device.marketingName.toLowerCase().includes(query) ||
        device.codename.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const allBrands = ['all', ...Array.from(new Set(firmwareData.map(b => b.brand)))];

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-primary" weight="duotone" />
        <h2 className="text-xl font-semibold">Firmware Library</h2>
        {isDemoMode && (
          <Badge variant="outline" className="bg-accent/10 border-accent text-accent">
            [DEMO DATA]
          </Badge>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by model, marketing name, or codename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={loadFirmwareDatabase}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {allBrands.map(brand => (
          <Button
            key={brand}
            variant={selectedBrand === brand ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedBrand(brand)}
          >
            {brand === 'all' ? 'All Brands' : brand}
          </Button>
        ))}
      </div>

      {selectedDevice ? (
        <Card className="flex-1 p-4 overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedDevice.marketingName}</h3>
              <p className="text-sm text-muted-foreground">
                Model: {selectedDevice.model} • Codename: {selectedDevice.codename}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDevice(null)}>
              Back to List
            </Button>
          </div>

          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="space-y-3">
              {selectedDevice.firmwares.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No firmware files available for this device</p>
                </div>
              ) : (
                selectedDevice.firmwares.map(firmware => (
                  <Card key={firmware.id} className="p-4 bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{firmware.version}</h4>
                          {firmware.isOfficial && (
                            <Badge variant="outline" className="bg-success/10 border-success text-success text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Official
                            </Badge>
                          )}
                          {firmware.isSecurityPatch && (
                            <Badge variant="outline" className="bg-primary/10 border-primary text-primary text-xs">
                              Security Patch
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Build: <span className="font-mono">{firmware.buildNumber}</span></p>
                          {firmware.androidVersion && (
                            <p>Android: {firmware.androidVersion}</p>
                          )}
                          {firmware.iosVersion && (
                            <p>iOS: {firmware.iosVersion}</p>
                          )}
                          <p>Region: {firmware.region} {firmware.carrier && `• ${firmware.carrier}`}</p>
                          <p>Released: {firmware.releaseDate} • Size: {firmware.size}</p>
                        </div>
                        {firmware.notes && (
                          <div className="mt-2 text-sm bg-muted/30 p-2 rounded">
                            <Info className="w-4 h-4 inline mr-1" />
                            {firmware.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleDownloadFirmware(firmware, selectedDevice.model)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyChecksum(firmware)}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <Card className="flex-1 p-4 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading firmware database...</p>
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DeviceMobile className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No devices found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'No firmware database loaded'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBrands.map(brand => (
                  <div key={brand.brand}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <DeviceMobile className="w-5 h-5 text-primary" weight="duotone" />
                      {brand.brand}
                    </h3>
                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {brand.devices.map(device => (
                        <Card
                          key={device.model}
                          className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => setSelectedDevice(device)}
                        >
                          <h4 className="font-medium mb-1">{device.marketingName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {device.model} • {device.codename}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {device.releaseYear}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {device.firmwares.length} firmware{device.firmwares.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

function getMockFirmwareData(): BrandFirmwares[] {
  return [
    {
      brand: 'Samsung',
      devices: [
        {
          model: 'SM-G998B',
          codename: 'p3s',
          marketingName: 'Galaxy S21 Ultra',
          releaseYear: 2021,
          firmwares: [
            {
              id: 'samsung-s21u-1',
              version: 'G998BXXU7DVH5',
              buildNumber: 'G998BXXU7DVH5',
              androidVersion: '14',
              releaseDate: '2023-09-15',
              size: '6.2 GB',
              downloadUrl: 'https://example.com/firmware/samsung/s21u/latest.zip',
              checksumMD5: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
              checksumSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Europe',
              notes: 'Latest security patch with performance improvements'
            },
            {
              id: 'samsung-s21u-2',
              version: 'G998BXXU6DVG1',
              buildNumber: 'G998BXXU6DVG1',
              androidVersion: '14',
              releaseDate: '2023-08-10',
              size: '6.1 GB',
              downloadUrl: 'https://example.com/firmware/samsung/s21u/prev.zip',
              checksumMD5: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
              checksumSHA256: 'f4c1c55398fc2c159bfbf5d9007fc03538bf52f5750c045db506002c8963c966',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Europe'
            }
          ]
        },
        {
          model: 'SM-S908B',
          codename: 'r0s',
          marketingName: 'Galaxy S22 Ultra',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'samsung-s22u-1',
              version: 'S908BXXU3DVJ3',
              buildNumber: 'S908BXXU3DVJ3',
              androidVersion: '14',
              releaseDate: '2023-10-20',
              size: '6.5 GB',
              downloadUrl: 'https://example.com/firmware/samsung/s22u/latest.zip',
              checksumMD5: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
              checksumSHA256: 'a5d2d66409fd3d260cfbg6e1008gd14649cg63g6861d156ec617113d9074d077',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'October 2023 security patch with OneUI 6.0 improvements'
            }
          ]
        },
        {
          model: 'SM-A536B',
          codename: 'a53x',
          marketingName: 'Galaxy A53 5G',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'samsung-a53-1',
              version: 'A536BXXU5CVK2',
              buildNumber: 'A536BXXU5CVK2',
              androidVersion: '14',
              releaseDate: '2023-11-05',
              size: '4.8 GB',
              downloadUrl: 'https://example.com/firmware/samsung/a53/latest.zip',
              checksumMD5: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
              checksumSHA256: 'b6e3e77510ge4e371dgch7f2119hf25750dh74h7972e267fd728224e1085e188',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Europe'
            }
          ]
        }
      ]
    },
    {
      brand: 'Xiaomi',
      devices: [
        {
          model: 'M2102J20SG',
          codename: 'venus',
          marketingName: 'Mi 11',
          releaseYear: 2021,
          firmwares: [
            {
              id: 'xiaomi-mi11-1',
              version: 'V14.0.5.0.TKBEUXM',
              buildNumber: 'V14.0.5.0.TKBEUXM',
              androidVersion: '14',
              releaseDate: '2023-09-28',
              size: '5.1 GB',
              downloadUrl: 'https://example.com/firmware/xiaomi/mi11/latest.zip',
              checksumMD5: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
              checksumSHA256: 'c7f4f88621hf5f482ehdi8g3220ig36861ei85i8083f378ge839335f2196f299',
              isOfficial: true,
              isSecurityPatch: false,
              region: 'Global',
              notes: 'MIUI 14 based on Android 14'
            },
            {
              id: 'xiaomi-mi11-2',
              version: 'V14.0.3.0.TKBEUXM',
              buildNumber: 'V14.0.3.0.TKBEUXM',
              androidVersion: '14',
              releaseDate: '2023-08-15',
              size: '5.0 GB',
              downloadUrl: 'https://example.com/firmware/xiaomi/mi11/prev.zip',
              checksumMD5: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
              checksumSHA256: 'd8g5g99732ig6g593fiej9h4331jh47972fj96j9194g489hf940446g3207g300',
              isOfficial: true,
              isSecurityPatch: false,
              region: 'Global'
            }
          ]
        },
        {
          model: '2201123G',
          codename: 'cupid',
          marketingName: 'Xiaomi 12',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'xiaomi-12-1',
              version: 'V14.0.6.0.TLCMIXM',
              buildNumber: 'V14.0.6.0.TLCMIXM',
              androidVersion: '14',
              releaseDate: '2023-10-12',
              size: '5.3 GB',
              downloadUrl: 'https://example.com/firmware/xiaomi/12/latest.zip',
              checksumMD5: 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
              checksumSHA256: 'e9h6h00843jh7h604gjfk0i5442ki58083gk07k0205h590ig051557h4318h411',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'HyperOS update with October security patch'
            }
          ]
        }
      ]
    },
    {
      brand: 'Google',
      devices: [
        {
          model: 'GE2AE',
          codename: 'raven',
          marketingName: 'Pixel 6 Pro',
          releaseYear: 2021,
          firmwares: [
            {
              id: 'google-p6p-1',
              version: 'TQ3A.230901.001',
              buildNumber: 'TQ3A.230901.001',
              androidVersion: '14',
              releaseDate: '2023-09-05',
              size: '2.8 GB',
              downloadUrl: 'https://example.com/firmware/google/p6p/latest.zip',
              checksumMD5: 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
              checksumSHA256: 'f0i7i11954ki8i715hkgl1j6553lj69194hl18l1316i601jh162668i5429i522',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'Android 14 with September 2023 security update'
            }
          ]
        },
        {
          model: 'GVU6C',
          codename: 'cheetah',
          marketingName: 'Pixel 7 Pro',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'google-p7p-1',
              version: 'TQ3A.230901.001',
              buildNumber: 'TQ3A.230901.001',
              androidVersion: '14',
              releaseDate: '2023-09-05',
              size: '2.9 GB',
              downloadUrl: 'https://example.com/firmware/google/p7p/latest.zip',
              checksumMD5: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
              checksumSHA256: 'g1j8j22065lj9j826iklm2k7664mk70205im29m2427j712ki273779j6530j633',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'Latest Android 14 with enhanced security features'
            }
          ]
        }
      ]
    },
    {
      brand: 'OnePlus',
      devices: [
        {
          model: 'LE2123',
          codename: 'lemonade',
          marketingName: 'OnePlus 9 Pro',
          releaseYear: 2021,
          firmwares: [
            {
              id: 'oneplus-9p-1',
              version: 'LE2123_11.F.33',
              buildNumber: 'LE2123_11.F.33',
              androidVersion: '14',
              releaseDate: '2023-10-01',
              size: '4.5 GB',
              downloadUrl: 'https://example.com/firmware/oneplus/9p/latest.zip',
              checksumMD5: 'j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5',
              checksumSHA256: 'h2k9k33176mk0k937jlmn3l8775nl81316jn30n3538k823lj384880k7641k744',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'OxygenOS 14 with ColorOS integration'
            }
          ]
        },
        {
          model: 'CPH2449',
          codename: 'salami',
          marketingName: 'OnePlus 11',
          releaseYear: 2023,
          firmwares: [
            {
              id: 'oneplus-11-1',
              version: 'CPH2449_11.C.62',
              buildNumber: 'CPH2449_11.C.62',
              androidVersion: '14',
              releaseDate: '2023-11-10',
              size: '5.2 GB',
              downloadUrl: 'https://example.com/firmware/oneplus/11/latest.zip',
              checksumMD5: 'k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
              checksumSHA256: 'i3l0l44287nl1l048kmno4m9886om92427ko41o4649l934mk495991l8752l855',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'Latest OxygenOS 14 with performance improvements'
            }
          ]
        }
      ]
    },
    {
      brand: 'Apple',
      devices: [
        {
          model: 'iPhone14,2',
          codename: 'D63AP',
          marketingName: 'iPhone 13 Pro',
          releaseYear: 2021,
          firmwares: [
            {
              id: 'apple-13p-1',
              version: '17.1.1',
              buildNumber: '21B91',
              iosVersion: '17.1.1',
              releaseDate: '2023-11-07',
              size: '7.2 GB',
              downloadUrl: 'https://example.com/firmware/apple/13p/latest.ipsw',
              checksumMD5: 'l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7',
              checksumSHA256: 'j4m1m55398om2m159lnop5n0997pn03538lp52p5750m045mn506002m8963m966',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'iOS 17.1.1 with critical security fixes'
            },
            {
              id: 'apple-13p-2',
              version: '17.0.3',
              buildNumber: '21A360',
              iosVersion: '17.0.3',
              releaseDate: '2023-10-04',
              size: '7.1 GB',
              downloadUrl: 'https://example.com/firmware/apple/13p/prev.ipsw',
              checksumMD5: 'm3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8',
              checksumSHA256: 'k5n2n66409pn3n260moqp6o1008qo14649mp63m6861n156on617113n9074n077',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global'
            }
          ]
        },
        {
          model: 'iPhone15,2',
          codename: 'D73AP',
          marketingName: 'iPhone 14 Pro',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'apple-14p-1',
              version: '17.1.1',
              buildNumber: '21B91',
              iosVersion: '17.1.1',
              releaseDate: '2023-11-07',
              size: '7.4 GB',
              downloadUrl: 'https://example.com/firmware/apple/14p/latest.ipsw',
              checksumMD5: 'n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9',
              checksumSHA256: 'l6o3o77510qo4o371nprs7p2119rp25750nq74n7972o267pn728224o1085o188',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'Latest iOS 17 with Dynamic Island improvements'
            }
          ]
        }
      ]
    },
    {
      brand: 'Oppo',
      devices: [
        {
          model: 'CPH2423',
          codename: 'OP4F2FL1',
          marketingName: 'Find X5 Pro',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'oppo-findx5p-1',
              version: 'CPH2423_11.C.21',
              buildNumber: 'CPH2423_11.C.21',
              androidVersion: '14',
              releaseDate: '2023-10-18',
              size: '5.6 GB',
              downloadUrl: 'https://example.com/firmware/oppo/findx5p/latest.zip',
              checksumMD5: 'o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0',
              checksumSHA256: 'm7p4p88621rp5p482oqst8q3220sq36861or85o8083p378qo839335p2196p299',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'ColorOS 14 based on Android 14'
            }
          ]
        }
      ]
    },
    {
      brand: 'Motorola',
      devices: [
        {
          model: 'XT2243-2',
          codename: 'felix',
          marketingName: 'Edge 30 Ultra',
          releaseYear: 2022,
          firmwares: [
            {
              id: 'moto-edge30u-1',
              version: 'T3SES33.73-22-7-5',
              buildNumber: 'T3SES33.73-22-7-5',
              androidVersion: '14',
              releaseDate: '2023-09-22',
              size: '3.8 GB',
              downloadUrl: 'https://example.com/firmware/motorola/edge30u/latest.zip',
              checksumMD5: 'p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1',
              checksumSHA256: 'n8q5q99732sq6q593prtu9r4331tr47972ps96p9194q489rp940446q3207q300',
              isOfficial: true,
              isSecurityPatch: true,
              region: 'Global',
              notes: 'Android 14 with My UX enhancements'
            }
          ]
        }
      ]
    }
  ];
}
