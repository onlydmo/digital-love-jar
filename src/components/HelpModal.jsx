import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const HelpModal = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#1a050b]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <div className="mx-auto bg-primary/20 p-3 rounded-full mb-4">
                        <span className="material-symbols-outlined text-primary text-2xl">help</span>
                    </div>
                    <DialogTitle className="text-center font-bold text-xl tracking-wide">Need Help?</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* FAQ 1 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gold text-sm uppercase tracking-wider">What is the "Secret Code"?</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                            This is the unique PIN you and your partner use to access your shared jar. It keeps your memories private and secure.
                        </p>
                    </div>

                    {/* FAQ 2 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gold text-sm uppercase tracking-wider">How do I invite my partner?</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Once you log in, go to <strong>Settings</strong> and click "Copy Invite Link". Send it to them, and they'll be able to join instantly!
                        </p>
                    </div>

                    {/* FAQ 3 */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-gold text-sm uppercase tracking-wider">I forgot my code!</h4>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Click "Forgot Code?" on the login screen. You can recover it using your partner's name and the security question you set up.
                        </p>
                    </div>

                    {/* Our Story Teaser */}
                    <div className="pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-white/40 italic">
                            "Built with love, for love." <br />
                            Digital Love Jar v1.0
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => onClose(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg font-bold text-sm transition-colors"
                >
                    Close
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default HelpModal;
