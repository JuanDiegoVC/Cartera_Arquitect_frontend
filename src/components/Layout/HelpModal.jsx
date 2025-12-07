import * as React from "react";
import { useState, useMemo } from "react";
import {
    X,
    Search,
    ChevronDown,
    ChevronRight,
    HelpCircle,
    CreditCard,
    Car,
    FileText,
    Settings,
    BookOpen,
} from "lucide-react";
import { Button } from "../ui/button";
import { FAQ_CATEGORIES, QUICK_GUIDE, searchFAQ } from "../../constants/helpContent";
import { useAuth } from "../../context/AuthContext";

// Mapeo de nombres de iconos a componentes
const iconMap = {
    HelpCircle,
    CreditCard,
    Car,
    FileText,
    Settings,
};

/**
 * HelpModal - Modal/Sidebar de ayuda global
 * 
 * Muestra documentación FAQ y guía rápida en un panel lateral
 * El contenido se filtra dinámicamente según el rol del usuario.
 */
export function HelpModal({ isOpen, onClose }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("faq"); // "faq" | "guide"
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedQuestions, setExpandedQuestions] = useState({});

    // Filtrar categorías según rol
    const filteredCategories = useMemo(() => {
        if (!user) return [];
        return FAQ_CATEGORIES.filter(category => {
            if (!category.roles || category.roles.includes("all")) return true;
            return category.roles.includes(user.rol);
        });
    }, [user]);

    // Resultados de búsqueda
    const searchResults = useMemo(() => {
        return searchFAQ(searchTerm, user?.rol);
    }, [searchTerm, user]);

    // Toggle para expandir/colapsar categoría
    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    // Toggle para expandir/colapsar pregunta
    const toggleQuestion = (questionId) => {
        setExpandedQuestions((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    };

    // Cerrar con Escape
    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Prevenir scroll del body cuando está abierto
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel lateral */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <HelpCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Centro de Ayuda
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Sotrapeñol - Guía de Usuario ({user?.rol || 'Invitado'})
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab("faq")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "faq"
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <HelpCircle className="h-4 w-4" />
                            Preguntas Frecuentes
                        </span>
                        {activeTab === "faq" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("guide")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${activeTab === "guide"
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Guía Rápida
                        </span>
                        {activeTab === "guide" && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === "faq" ? (
                        <FAQContent
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            searchResults={searchResults}
                            categories={filteredCategories}
                            expandedCategory={expandedCategory}
                            toggleCategory={toggleCategory}
                            expandedQuestions={expandedQuestions}
                            toggleQuestion={toggleQuestion}
                        />
                    ) : (
                        <GuideContent userRole={user?.rol} />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/30">
                    <p className="text-xs text-center text-muted-foreground">
                        ¿No encontraste lo que buscabas?{" "}
                        <button className="text-primary hover:underline font-medium">
                            Contactar Soporte
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}

/**
 * Contenido de FAQ
 */
function FAQContent({
    searchTerm,
    setSearchTerm,
    searchResults,
    categories,
    expandedCategory,
    toggleCategory,
    expandedQuestions,
    toggleQuestion,
}) {
    return (
        <div className="p-4 space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar en las preguntas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Resultados de búsqueda o categorías */}
            {searchTerm.length >= 2 ? (
                <SearchResults
                    results={searchResults}
                    expandedQuestions={expandedQuestions}
                    toggleQuestion={toggleQuestion}
                />
            ) : (
                <div className="space-y-2">
                    {categories.map((category) => {
                        const IconComponent = iconMap[category.icon] || HelpCircle;
                        const isExpanded = expandedCategory === category.id;

                        return (
                            <div
                                key={category.id}
                                className="border rounded-lg overflow-hidden"
                            >
                                {/* Cabecera de categoría */}
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-primary/10">
                                            <IconComponent className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-sm">{category.title}</span>
                                        <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                                            {category.questions.length}
                                        </span>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </button>

                                {/* Preguntas de la categoría */}
                                {isExpanded && (
                                    <div className="border-t bg-muted/20">
                                        {category.questions.map((q) => (
                                            <QuestionItem
                                                key={q.id}
                                                question={q}
                                                isExpanded={expandedQuestions[q.id]}
                                                onToggle={() => toggleQuestion(q.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * Resultados de búsqueda
 */
function SearchResults({ results, expandedQuestions, toggleQuestion }) {
    if (results.length === 0) {
        return (
            <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground text-sm">
                    No se encontraron resultados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Intenta con otros términos de búsqueda
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
                {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
                {results.length !== 1 ? "s" : ""}
            </p>
            {results.map((result) => (
                <div key={result.id} className="border rounded-lg overflow-hidden">
                    <QuestionItem
                        question={result}
                        isExpanded={expandedQuestions[result.id]}
                        onToggle={() => toggleQuestion(result.id)}
                        showCategory
                    />
                </div>
            ))}
        </div>
    );
}

/**
 * Item de pregunta individual
 */
function QuestionItem({ question, isExpanded, onToggle, showCategory = false }) {
    return (
        <div className="border-b last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full text-left p-3 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-start gap-2">
                    <span className="mt-0.5">
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-primary" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </span>
                    <div className="flex-1">
                        {showCategory && (
                            <span className="text-xs text-primary font-medium">
                                {question.category}
                            </span>
                        )}
                        <p className="text-sm font-medium text-foreground">
                            {question.question}
                        </p>
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div className="px-9 pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {question.answer}
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Contenido de Guía Rápida
 */
function GuideContent({ userRole }) {
    // Filtrar secciones de la guía según el rol
    const filteredSections = useMemo(() => {
        return QUICK_GUIDE.sections.filter(section => {
            if (!section.roles || section.roles.includes("all")) return true;
            return userRole && section.roles.includes(userRole);
        });
    }, [userRole]);

    return (
        <div className="p-4 space-y-6">
            <div className="text-center py-4">
                <BookOpen className="h-10 w-10 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-semibold">{QUICK_GUIDE.title}</h3>
            </div>

            {filteredSections.map((section, index) => (
                <div key={index} className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                        </span>
                        {section.title}
                    </h4>
                    <div className="pl-8 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {section.content.trim()}
                    </div>
                </div>
            ))}

            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-center">
                    <span className="font-medium text-primary">💡 Consejo:</span>{" "}
                    <span className="text-muted-foreground">
                        Pase el cursor sobre cualquier campo con el icono{" "}
                        <HelpCircle className="inline h-3 w-3" /> para ver ayuda contextual.
                    </span>
                </p>
            </div>
        </div>
    );
}

export default HelpModal;
