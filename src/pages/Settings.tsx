import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Configurações"
                subtitle="Gerencie as preferências do sistema"
            />

            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Aparência</h3>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label className="text-base">Tema</Label>
                        <p className="text-sm text-muted-foreground">
                            Selecione o tema de sua preferência para o painel.
                        </p>
                    </div>
                    <ModeToggle />
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Sobre o Sistema</h3>
                <div className="space-y-4">
                    <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Versão</span>
                        <span className="text-sm text-muted-foreground">1.0.0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between py-2">
                        <span className="text-sm font-medium">Ambiente</span>
                        <span className="text-sm text-muted-foreground">Produção</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
