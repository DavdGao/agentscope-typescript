import { Trash2, Search, Plus, FolderInput, FolderSymlink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { EmptySearch, EmptySkill } from './empty';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardAction,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSkills } from '@/hooks/use-skills';
import { useTranslation } from '@/i18n/useI18n';

/**
 * The skill page component for managing skills.
 *
 * @returns A SkillPage component.
 */
export function SkillPage() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const { skills, loading, setActive, remove, importSkill, addWatchDir } = useSkills();

    const handleImport = async () => {
        const result = await importSkill();
        if (result.success) {
            toast.success(t('skill.importSuccess'), {
                description: `${result.skill?.name} has been imported successfully.`,
                position: 'top-center',
            });
        } else {
            toast.error(t('skill.importFailed'), {
                description: result.error,
                position: 'top-center',
            });
        }
    };

    const handleMonitor = async () => {
        const result = await addWatchDir();
        if (result.success) {
            toast.success(t('skill.monitorSuccess'), {
                description: `${result.skillsAdded} skill(s) found in the directory.`,
                position: 'top-center',
            });
            if (result.errors.length > 0) {
                toast.warning(t('skill.someSkillsInvalid'), {
                    description: `${result.errors.length} subdirectories have no valid SKILL.md.`,
                    position: 'top-center',
                });
            }
        } else {
            toast.error(t('skill.monitorFailed'), {
                description: result.errors.join(', '),
                position: 'top-center',
            });
        }
    };

    const filteredSkills = skills.filter(
        skill =>
            skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (skill.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (skill.author ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addSkillMenu = (
        <TooltipProvider>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm">
                        <Plus />
                        <span>{t('skill.addSkill')}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleImport}>
                        <FolderInput className="mr-2 size-4" />
                        <span>{t('skill.importSkill')}</span>
                    </DropdownMenuItem>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuItem onClick={handleMonitor}>
                                <FolderSymlink className="mr-2 size-4" />
                                <span>{t('skill.monitorDirectory')}</span>
                            </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p className="max-w-xs text-sm">{t('skill.monitorDirectoryDesc')}</p>
                        </TooltipContent>
                    </Tooltip>
                </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
    );

    if (loading) return null;

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{t('skill.title')}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t('skill.description')}
                        </p>
                    </div>
                    {addSkillMenu}
                </div>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder={t('skill.search')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-sm"
                    />
                </div>
            </div>

            {filteredSkills.length === 0 ? (
                searchQuery ? (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptySearch />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptySkill addTrigger={addSkillMenu} />
                    </div>
                )
            ) : (
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSkills.map(skill => (
                            <Card
                                key={skill.name}
                                className={`group transition-all hover:bg-accent/50 cursor-pointer ${
                                    skill.isActive ? 'border-primary/50 shadow-sm' : 'border-border'
                                }`}
                                onClick={() => setActive(skill.name, !skill.isActive)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <span
                                            className={`size-2 rounded-full ${
                                                skill.isActive
                                                    ? 'bg-primary'
                                                    : 'bg-muted-foreground/30'
                                            }`}
                                        />
                                        {skill.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-3 break-words">
                                        {skill.description}
                                    </CardDescription>
                                    <CardAction>
                                        <Button
                                            size="icon-sm"
                                            variant="secondary"
                                            onClick={e => {
                                                e.stopPropagation();
                                                remove(skill.name);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('skill.status')}:
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    skill.isActive
                                                        ? 'text-primary'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {skill.isActive
                                                    ? t('skill.active')
                                                    : t('skill.inactive')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('skill.version')}:
                                            </span>
                                            <span className="font-medium">{skill.version}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('skill.author')}:
                                            </span>
                                            <span className="font-medium">{skill.author}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                {t('skill.imported')}:
                                            </span>
                                            <span className="font-medium">
                                                {new Date(skill.importedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
