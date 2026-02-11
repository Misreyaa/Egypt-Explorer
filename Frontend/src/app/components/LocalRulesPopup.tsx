import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface LocalRulesPopupProps {
  open: boolean;
  onClose: () => void;
}

export const LocalRulesPopup: React.FC<LocalRulesPopupProps> = ({ open, onClose }) => {
  const { markRulesAsSeen } = useUser();

  const handleAccept = () => {
    markRulesAsSeen();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Welcome to Egypt Explorer! 🇪🇬
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            أهلاً بك في مستكشف مصر! (Welcome in Arabic)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* English Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Community Guidelines (English)
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Be Authentic:</strong> Share genuine experiences and accurate information about locations, services, and cultural insights.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Respect Privacy:</strong> Do not share personal information of tourists or other locals without consent.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Professional Conduct:</strong> Maintain professionalism in all interactions. Harassment, discrimination, or offensive behavior will result in account suspension.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Accurate Pricing:</strong> Be transparent about all fees and charges. Hidden costs are strictly prohibited.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Safety First:</strong> Ensure all services meet safety standards. Report any safety concerns immediately.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>Cultural Sensitivity:</strong> Help tourists understand and respect Egyptian culture and traditions.</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Arabic Section */}
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              إرشادات المجتمع (عربي)
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>كن صادقاً:</strong> شارك تجارب حقيقية ومعلومات دقيقة عن المواقع والخدمات والرؤى الثقافية.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>احترم الخصوصية:</strong> لا تشارك المعلومات الشخصية للسياح أو السكان المحليين الآخرين دون موافقة.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>السلوك المهني:</strong> حافظ على الاحترافية في جميع التعاملات. التحرش أو التمييز أو السلوك المسيء سيؤدي إلى تعليق الحساب.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>تسعير دقيق:</strong> كن شفافاً بشأن جميع الرسوم والتكاليف. التكاليف المخفية ممنوعة تماماً.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>السلامة أولاً:</strong> تأكد من أن جميع الخدمات تلبي معايير السلامة. أبلغ عن أي مخاوف تتعلق بالسلامة فوراً.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span><strong>الحساسية الثقافية:</strong> ساعد السياح على فهم واحترام الثقافة والتقاليد المصرية.</span>
              </li>
            </ul>
          </div>

          <Separator />

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Important Notice / إشعار هام
                </p>
                <p className="text-amber-800 dark:text-amber-200">
                  By clicking "I Agree", you acknowledge that you have read and agree to follow these guidelines. Violations may result in account suspension or termination.
                </p>
                <p className="text-amber-800 dark:text-amber-200" dir="rtl">
                  بالنقر على "أوافق"، فإنك تقر بأنك قرأت ووافقت على اتباع هذه الإرشادات. قد تؤدي الانتهاكات إلى تعليق الحساب أو إنهائه.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAccept} className="flex-1 bg-pine-primary hover:bg-pine-dark">
              I Agree / أوافق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
